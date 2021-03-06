events = [
  {
    action: "join",
    from: "player",
    to: "server",
    data: {
      name: "my name"
    }
  },
  {
    action: 'youJoined',
    from: 'server',
    to: 'player',
    data: {
      name: "player name", 
      otherPlayers: [{name: "other player's name"}]
    }
  },
  {
    action: "newPlayerJoined",
    from: 'server',
    to: 'room1',
    data: {
      player: {name: "joined player's name"}
    }
  },
  {
    action: "gameStarts",
    from: "server",
    to: "room1",
    data: {
      matchID: match.id
    }
  },
  {
    action: "sendCards",
    from: "server",
    to: "player",
    data: {
      cards: [{name: "c2"}, {}]
    }
  },
  {
    action: "read",
    from: "server",
    to: "player",
    data: {
      highestRead: 150,
    }
  },
  {
    action: "Iread",
    from: "player",
    to: "server",
    data: {
      read: 150,
    }
  },
  {
    action: "otherPlayerRead",
    from: "server",
    to: "room1",
    data: {
      name: "other player's name",
      read: 150,
    }
  },
  {
    action: "command",
    from: "server",
    to: "player",
    data: {
      replaceCards: [{name: "d2"}, {}]
    }
  },
  {
    action: "Icommand",
    from: "player",
    to: "server",
    data: {
      command: "hc",
      newCards: [{name: "c3"}, {}]
    }
  },
  {
    action: "otherPlayerCommand",
    from: "server",
    to: "room1",
    data: {
      name: "other player's name",
      command: "hc"
    }
  },
  {
    action: "lastGameCanceled",
    from: "server",
    to: "romm1",
    data: {}
  },
  {
    action: "",
    from: "",
    to: "",
    data: {
      
    }
  }
];
commands: 

          ["hoc", "hod", "hos", "hoh",
          "sac", "sad", "sas", "sah",
          "nac", "nad", "nas", "nah",
          "anc", "and", "ans", "anh"]