import bootbox from "bootbox"

export default function SocketManager() {
  var self = this;

  self.connections = [];

  self.DisconnectAll = function() {
    for (var ws of self.connections) {
      ws.close();
    }
  };

  self.Connect = function(url, messageCallback) {
    var defer = $.Deferred();
    var sock = wsConnect(url, defer, messageCallback);
    self.connections.push(sock);

    return defer;
  };
}

function wsConnect(url, defer, messageFn) {
  var ws = null;

  if (WebSocket === undefined) {
    alert('You will need WebSockets to run the monitoring tools');
  } else {
    ws = new WebSocket(url);
    ws.onopen = function (e) {
      defer.resolve();
    };

    ws.onerror = function(e) {
      defer.reject();
      bootbox.alert("Websocket error");
    }

    ws.onmessage = messageFn;
  }

  return ws;
}
