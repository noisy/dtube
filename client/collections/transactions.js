Notifications = new Mongo.Collection(null)

stopStreamTransactions = null

Notifications.startListening = function () {
  stopStreamTransactions = steem.api.streamTransactions(function (err, result) {
    if (!result || !result.operations || result.operations.length < 1) return
    for (let i = 0; i < result.operations.length; i++) {
      var op = result.operations[i]
      Notifications.filterOperations(op)
    }
  })
}

Notifications.filterOperations = function(op) {
  switch (op[0]) {
    case "vote":
      if (Session.get('activeUsername') == op[1].author)
        Notifications.insert({type: 'vote', tx: op[1]})
      break;
    case "comment":
      if (Session.get('activeUsername') == op[1].parent_author)
        Notifications.insert({type: 'comment', tx: op[1]})
      break;
    case "custom_json":
      op[1].json = JSON.parse(op[1].json)
      if (op[1].json[0] == "follow")
        if (Session.get('activeUsername') == op[1].json[1].following)
          Notifications.insert({type: 'subscribe', tx: op[1]})
      break;
  }
}