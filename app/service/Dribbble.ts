import * as addMilliseconds from '@bit/date-fns.date-fns.add-milliseconds';

import { Service } from 'egg';
import { sleep } from '../utils';

export default class DribbbleService extends Service {
  /**
   *
   * 批量添加Dribbble账户信息
   * @param {Array<DribbbleAccount>} accounts 账户信息列表
   * @returns
   * @memberof DribbbleService
   */
  async createAccounnt(accounts) {
    const successQueue = [] as any[]; // 成功添加
    const existsQueue = [] as any[]; // 已存在
    const errorQueue = [] as any[]; // 错误队列
    // 这里来处理批量添加的逻辑
    for (const account of accounts) {
      // 排查当前账号是否已存在数据库
      if (!(await this.findDribbbleAccountByAccount(account.account))) {
        account.id = await this.ctx.service.counter.getNextSequence(
          'dribbble_account'
        );
        try {
          const result = await this.ctx.model.DribbbleAccount.create(account);
          if (result) {
            successQueue.push(account);
          } else {
            errorQueue.push(account);
          }
        } catch (e) {
          this.ctx.logger.error(e.message);
          errorQueue.push(account);
        }
      } else {
        this.ctx.logger.info(`dribbble_account exists：${account.account}`);
        existsQueue.push(account);
      }
    }
    return {
      success: successQueue,
      error: errorQueue,
      exists: existsQueue,
    };
  }
  /**
   * 填充账户信息，支持批量操作
   * @param {Account[]} accounts 账户信息
   * @memberof DribbbleService
   */
  async fillAccountInfo(accounts) {
    const successQueue = [] as any[];
    const errorQueue = [] as any[];
    for (const account of accounts) {
      const result = await this.ctx.service.worker.dribbble.getUserInfo(
        account
      );
      if (result) {
        successQueue.push(result);
      } else {
        errorQueue.push(account);
      }
      // 休眠5秒
      await sleep(30000);
    }
    return {
      success: successQueue,
      error: errorQueue,
    };
  }

  /**
   * 查询是否存在账户信息
   *
   * @param {*} account
   * @returns
   * @memberof DribbbleService
   */
  async findDribbbleAccountByAccount(account) {
    return this.ctx.model.DribbbleAccount.findOne({
      account: { $eq: account },
    }).exists(account, false);
  }
  /**
   * 创建一个任务组
   *
   * @param {*} job 任务目标信息，额外信息会通过网络获取
   * @returns
   * @memberof DribbbleService
   */
  async createJob(job) {
    const dribbbleWorker = this.ctx.service.worker.dribbble;
    try {
      const info = await dribbbleWorker.getShotInfo(job.source);
      job = { ...job, ...info };
    } catch (e) {
      throw new Error('未获取到Shot信息，请检查后重试');
    }
    job.id = await this.ctx.service.counter.getNextSequence('dribbble_job');
    return this.ctx.model.DribbbleJob.create(job);
  }

  async findJobBySource(source) {
    return this.ctx.model.DribbbleJob.findOne({ source: { $eq: source } });
  }

  /**
   * 获取用户信息
   *
   * @param {*} account 登录账户名
   * @param {*} password 登录密码
   * @memberof DribbbleService
   */
  async getUserInfoByAccountAndPassword(account, password) {
    return this.ctx.service.worker.dribbble.getUserInfo({ account, password });
  }

  async createTask(dribbbleJob) {
    // 1. 查询出所有可用的账号ID
    const { DribbbleAccount, DribbbleTask, DribbbleJob } = this.ctx.model;
    const { counter } = this.ctx.service;
    const usableAccount = await DribbbleAccount.find({
      status: { $eq: 1 },
    }).select('id');
    if (usableAccount && usableAccount.length > 0) {
      for (let i = 0; i < usableAccount.length; i++) {
        const account = usableAccount[i];
        const { timeRange } = dribbbleJob;
        const stepSec = (timeRange * 60 * 60) / usableAccount.length; // 任务间隔时间（单位：秒）
        const task = {
          id: await counter.getNextSequence('dribbble_task'),
          jobId: dribbbleJob.id,
          accountId: account.id,
          startTime: addMilliseconds(new Date(), stepSec * (i + 1)),
        };
        await DribbbleTask.create(task);
      }
      // 更新任务信息
      await DribbbleJob.updateOne(
        { id: { $eq: dribbbleJob.id } },
        { all: usableAccount.length }
      );
    } else {
      throw new Error('创建任务失败，请添加Dribbble账号后重试');
    }
  }
  // 执行定时任务
  async execTask() {
    const { DribbbleTask, DribbbleAccount, DribbbleJob } = this.ctx.model;
    // 查询当前时间+5分钟以前的所有未执行的任务
    const time = addMilliseconds(new Date(), 5 * 60);
    const tasks = await DribbbleTask.find({
      startTime: { $lte: time },
      status: { $eq: -1 },
    });
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        // 查询出账号信息，查询出任务信息，然后操作
        const job = await DribbbleJob.findOne({ id: { $eq: task.jobId } });
        const account = await DribbbleAccount.findOne({
          id: { $eq: task.accountId },
        });
        if (+job.likeEnable === 1) {
          // 点赞
          // 计时
          const start = new Date().getTime();
          const likenum = this.ctx.service.worker.dribbble.like(account, job);
          if (likenum) {
            // 更新当前task状态
            await DribbbleTask.findOneAndUpdate(
              { _id: { $eq: task._id } },
              {
                action: ['like'],
                status: 1,
                totalTime: Math.ceil((new Date().getTime() - start) / 1000), // 任务耗时（单位：秒）
              }
            );
          }
        }
      }
    } else {
      this.ctx.logger.info('当前没有任务需要执行');
    }
  }

  /**
   * 查询未初始化的账户，进行初始化登录
   * 每个任务间隔五秒执行
   * @memberof DribbbleService
   */
  async initialAccount() {
    const { DribbbleAccount } = this.ctx.model;
    const accounts = await DribbbleAccount.find(
      { status: { $eq: 0 } },
      { account: 1, password: 1 },
    );
    if (accounts && accounts.length > 0) {
      this.fillAccountInfo(accounts);
    }
  }
}
