const sqlite3 = require('sqlite3').verbose();
const sqlEscape = require('sql-escape');
const knex = require('knex')({ client: 'sqlite3' });

let db = null;

let settings = {
  sqlitePath: './visits.sqlite'
}

let VisitLogger = (req, res, next) => {

  db.serialize(function () {
    db.run(`INSERT INTO visits VALUES (datetime('now'), "${sqlEscape(req.path)}");`);
  });

  next();
};

let sqlHandleOptions = (sql, options) => {
  let path, range;
  if (typeof options == "string") {
    path = options;
  } else if (typeof options == "object") {
    path = typeof options.path === "string" ? options.path : null;
    range = typeof options.range === "object" && options.range.length === 2 ? options.range : null;
  }
  if (path) {
    sql = sql.where("path", sqlEscape(path));
  }
  if (range) {
    sql = sql.whereBetween("timestamp", range.map(x => sqlEscape(x)));
  }
  return sql;
}

let VisitLoader = {
  clearLog: () => {
    db.run("DELETE FROM visits;");
  },
  getLog: (options) => {
    let path = typeof options == "string" ? options : (typeof options == "object" && typeof options.path === "string" ? options.path : null);
    let sql = knex.select().from("visits");
    sql = sqlHandleOptions(sql, options);

    return new Promise((resolve, reject) => {
      db.all(sql.toString(), [], (err, rows) => {
        if (err) {
          reject({ 'error': err });
        } else {
          if (path) {
            resolve(rows.map(o => o.timestamp));
          } else {
            resolve(rows);
          }
        }
      });
    });
  },
  getCount: (options) => {
    let sql = knex.select(knex.raw("COUNT(*) AS n")).from("visits");
    sql = sqlHandleOptions(sql, options);

    return new Promise((resolve, reject) => {
      db.get(sql.toString(), (err, row) => {
        if (err) {
          reject({ 'error': err });
        } else {
          resolve(row.n);
        }
      });
    });
  }
}

let initialize = (options) => {
  if (typeof options === "object" && typeof options.sqlitePath === "string") {
    settings.sqlitePath = options.sqlitePath;
  }

  db = new sqlite3.Database(settings.sqlitePath, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  db.serialize(function () {
    db.run(`CREATE TABLE IF NOT EXISTS visits (timestamp datetime, path TEXT);`);
  });

  return VisitLogger;
}

module.exports = VisitLogger;
module.exports.Logger = VisitLogger;
module.exports.Loader = VisitLoader;
module.exports.initialize = initialize;