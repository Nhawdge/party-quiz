let socket = io() // Connect to server


function JoinViewModel() {
    var self = this;

    self.AvailableRooms = ko.observableArray();

    self.RoomName = ko.observable();
    self.Passcode = ko.observable();

    self.Create = function () {
        socket.emit('newQuiz', {
            roomName: self.RoomName(),
            Passcode: self.Passcode()
        });
    }

    self.Join = function () {
        socket.emit('joinQuiz', {
            roomName: self.RoomName(),
            Passcode: self.Passcode()
        });
    }
    socket.on("NewRoom", function (data) {
        self.AvailableRooms.push(data.roomName);
    })

}

function GameViewModel() {
    var self = this;
    self.RoomName = ko.observable();


}

function BaseViewModel() {
    var self = this;
    self.State = ko.observable(1)
    self.JoinVM = new JoinViewModel();
    self.GameVM = new GameViewModel();
}
ko.applyBindings(new BaseViewModel())