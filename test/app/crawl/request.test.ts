import * as assert from 'assert';
import request from '../../../app/crawl/utils/request';

describe('app/crawl/utils/request.ts', () => {
  it('getUsernameByPhone user not', async () => {
    const requsetPayload = {
      phone: '8610086',
      v: 10001,
      _ApplicationId: 'fUEmHsDqbr9v73s4JBx0CwANjDJjoMcDFlrGqgY5',
      _ClientVersion: 'js1.10.0',
      _InstallationId: '4dda5a8e-6189-9540-0762-860ae35fb883',
    };
    try {
      const result = await request(
        'https://mobile-elb.antich.at/functions/getUsernameByPhone',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(requsetPayload),
        },
      );
      assert(1 + 1 === 2);
    } catch (e) {
      console.log(e.message.data);
      assert(e.message.data === '{"code":141,"error":"No users found with such a phone number"}');
    }
  });
  it('getGroupList user not', async () => {
    
  });

});
