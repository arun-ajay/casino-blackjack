const sqlite3 = require("sqlite3").verbose()



let db = new sqlite3.Database('./blackjack.db', (err) => {
     if (err) {
       return console.error(err.message);
     }
     console.log('Connected to database.');
});


db.serialize(function() {
   
     var stmt = db.prepare("INSERT INTO GAMEDATA VALUES (?,?,?,?,?,?,?)");
     stmt.run("addres","rcom","rcom2",100,200,"rp1","rp2")
     stmt.finalize();

     db.each("SELECT * FROM GAMEDATA", function (err,row) {
          console.log(Object.keys(row))

     })

   });