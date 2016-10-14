sh.addShard("mongo_shard1:27018");
sh.addShard("mongo_shard2:27018");
sh.addShard("mongo_shard3:27018");

sh.addShardTag("shard0000", "TRASH");
sh.addShardTag("shard0001", "USED");
sh.addShardTag("shard0002", "USED");

//clear
use testdb;
db.dropDatabase();

use config;
db.tags.remove({});

sh.enableSharding("testdb");
sh.shardCollection("testdb.transactions", { "global_type": 1, "msisdn": 1 } );

sh.addTagRange( "testdb.transactions",
                { global_type: NumberInt(100), msisdn: MinKey },
                { global_type: NumberInt(100), msisdn: MaxKey },
                "TRASH"
              );

db.adminCommand( { moveChunk : "testdb.transactions",
                   find : { "global_type": { $gte: 200, $lt: 250 }, "msisdn": { $exists: true } },
                   to : "shard0001" } );

sh.moveChunk("testdb.transactions", { global_type: 210, msisdn:"79210000000" }, "shard0002");

sh.status();

//sh.addTagRange( "testdb.transactions",
//                { global_type: 200, msisdn: MinKey },
//                { global_type: MaxKey, msisdn: MaxKey },
//                "USED"
//              );