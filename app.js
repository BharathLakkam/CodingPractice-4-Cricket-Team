const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const convertdbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
initialiseDBAndServer();
app.get("/players/", async (request, response) => {
  const getplayersDataQuery = `SELECT * FROM cricket_team;`;
  const playersList = await db.all(getplayersDataQuery);
  response.send(
    playersList.map((eachPlayer) => {
      return convertdbObjectToResponseObject(eachPlayer);
    })
  );
});
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addplayersDataQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES("${playerName}",${jerseyNumber},"${role}");`;
  const addplayerData = await db.run(addplayersDataQuery);
  const playerId = addplayerData.lastID;
  response.send("Player Added to Team");
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerDataQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getplayerDataQuery);
  response.send(convertdbObjectToResponseObject(player));
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const addplayersDataQuery = `UPDATE cricket_team SET player_name="${playerName}",jersey_number=${jerseyNumber},role="${role}" WHERE player_id=${playerId};`;
  const addplayerData = await db.run(addplayersDataQuery);
  const playerId = addplayerData.lastID;
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayerDataQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteplayerDataQuery);
  response.send("Player Removed");
});
module.exports = app;
