/*
 * File: resources.js
 * File Created: Tuesday, 5th March 2019 11:30:55 am
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectResource form '@chengchengw/backing-service-common/lib/connectResource';
import connectMongodb from '@chengchengw/backing-service-mongodb';


const connect = ({logger }) => {
  return connectResource({
    connectors:[
      connectMongodb,
    ]
  })
}

export default connect;