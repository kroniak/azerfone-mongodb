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
sh.shardCollection("testdb.transactions", { "global_type": 1} );

sh.addTagRange( "testdb.transactions",
                { global_type: 10000000000000},
                { global_type: 20000000000000},
                "TRASH"
              );
              
sh.addTagRange( "testdb.transactions",
                { global_type: 20000000000000},
                { global_type: 30000000000000},
                "USED"
              );

sh.moveChunk("testdb.transactions", { global_type: 25000000000000 }, "shard0002");

sh.status();