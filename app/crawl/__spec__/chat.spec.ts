import logger from '../../utils/logger';
import Chat from './../spider/chat';

const chatroom = new Chat();

(async () => {
    const user = {
        username: '18608004899',
        password: '225062',
    };
    const userExsist = await chatroom.checkUserExsist(86, user.username);
    if (userExsist) {
        logger.info(`${user.username}用户存在`);
    } else {
        logger.error(`${user.username}用户不存在`);
    }
    const result = await chatroom.login('18608004899', '225062');
    logger.info(result);
})();
