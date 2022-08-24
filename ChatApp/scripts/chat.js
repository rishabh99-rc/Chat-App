var currentUserKey;
var chatKey;


document.addEventListener('keydown', function (key) {
    if (key.which === 13) {
        sendMessage();
    }
});

function changeSendIcon(control) {
    if (control.value !== '') {
        document.getElementById('send').removeAttribute('style');
        document.getElementById('send').setAttribute('style' , 'color : rgb(122, 235, 122);');
        document.getElementById('audio').setAttribute('style', 'display:none');
    }
    else {
        document.getElementById('audio').removeAttribute('style');
        document.getElementById('audio').setAttribute('style' , 'color : rgb(122, 235, 122);');
        document.getElementById('send').setAttribute('style', 'display:none');
    }
}

let chunks = [];
let recorder;
var timeout;

function record(control) {
    const device = navigator.mediaDevices.getUserMedia({ audio: true });
    device.then(stream => {
        if (recorder === undefined) {
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);

                if (recorder.state === 'inactive') {
                    let blob = new Blob(chunks, { type: 'audio/webm' });
                    //document.getElementById('audio').innerHTML = '<source src="' + URL.createObjectURL(blob) + '" type="video/webm" />'; //;
                    var reader = new FileReader();

                    reader.addEventListener("load", function () {
                        var chatMessage = {
                            userId: currentUserKey,
                            msg: reader.result,
                            msgType: 'audio',
                            dateTime: new Date().toLocaleString()
                        };

                        firebase.database().ref('chatMessage').child(chatKey).push(chatMessage, function (error) {
                            if (error) alert(error);
                            else {

                                document.getElementById('txtMessage').value = '';
                                document.getElementById('txtMessage').focus();
                            }
                        });
                    }, false);

                    reader.readAsDataURL(blob);
                }
            }

            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x');
            document.getElementById('audio').setAttribute('style','color:red');        
        }
    });

    if (recorder !== undefined) {
        if (control.getAttribute('class').indexOf('stop') !== -1) {
            recorder.stop();
            control.setAttribute('class', 'fas fa-microphone fa-2x');
            control.setAttribute('style','color : rgb(122, 235, 122);');
        }
        else {
            chunks = [];
            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x');
            document.getElementById('audio').setAttribute('style','color:red');
        }
    }
}


function smile() {
    var a;
    a = document.getElementById("smileys");
    a.innerHTML = "&#xf118;";
    setTimeout(function () {
        a.innerHTML = "&#xf11a;";
      }, 1000);
    setTimeout(function () {
        a.innerHTML = "&#xf119;";
      }, 2000);
    setTimeout(function () {
        a.innerHTML = "&#xf11a;";
      }, 3000);
  }
  smile();
  setInterval(smile, 4000);

function showEmoji() {
    document.getElementById('emoji').removeAttribute('style');
}

function hideEmoji() {
    document.getElementById('emoji').setAttribute('style', 'display:none;');
}

function getEmoji(control) {
    document.getElementById('txtMessage').value += control.innerHTML;
}

loadAllEmoji();
function loadAllEmoji() {
    var emoji = '';
    for (var i = 128512; i <= 128567; i++) {
        emoji += `<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    document.getElementById('smiley').innerHTML = emoji;

    var shape = ''
    for (var i = 128070; i <= 128080; i++) {
        shape += `<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }

    for (var i = 128112; i <= 128120; i++) {
        shape += `<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }

    for (var i = 129304; i <= 129311; i++) {
        shape += `<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    document.getElementById('shape').innerHTML = shape;
}

function startChat(key, name, image) {
    var friend_list = { friendId: key, userId: currentUserKey };
    var db = firebase.database().ref('friendList');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friend_list.friendId && user.userId === friend_list.userId) || (user.friendId === friend_list.userId && user.userId === friend_list.friendId)) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('friendList').push(friend_list, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('start').setAttribute('style', 'display:none');
                    hideChatList();
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('start').setAttribute('style', 'display:none');
            hideChatList();
        }
        document.getElementById('friendPic').src = image;
        document.getElementById('friendName').innerHTML = name;
        document.getElementById('messages').innerHTML = '';

        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();
        LoadChatMessages(chatKey, image);
    });
}

function LoadChatMessages(chatKey, image) {
    var db = firebase.database().ref('chatMessage').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var datetime = chat.dateTime.split(',');
            var msg = '';
            if (chat.msgType === 'image') {
                msg = `<img src='${chat.msg}' class="img-fluid"/>`;
            }
            else if(chat.msgType === 'audio'){
                msg = `<audio src='${chat.msg}' style="width:200px;" controls></audio>`;
            }
            else {
                msg = chat.msg;
            }

            

            if (chat.userId !== currentUserKey) {
                messageDisplay += ` <div class="row">
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${image}" alt="" class="chat-pic rounded-circle">
                            </div>
                            <div class="col-7 col-sm-7 col-md-7">
                                <p class="receive">${msg}
                                <span class="time" title="${datetime[0]}">${datetime[1]}</span>
                                    
                                </p>
                            </div>
                        </div> `;
            }
            else {
                messageDisplay += `<div class="row justify-content-end">
                <div class="col-7 col-sm-7 col-md-7">
                    <p class="sent float-right">
                    ${msg}
                    <span class="time" title="${datetime[0]}">${datetime[1]}</span> 
                    </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img  src="${user_data.photoURL}" alt="" class="chat-pic rounded-circle">
                </div>
            </div>`;
            }
        });

        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();

        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);


    });

}



function chatList() {
    document.getElementById('contacts').classList.remove('d-none', 'd-md-block');
    document.getElementById('chatArea').classList.add('d-none');
}

function hideChatList() {
    document.getElementById('contacts').classList.add('d-none', 'd-md-block');
    document.getElementById('chatArea').classList.remove('d-none');
}

function sendMessage() {
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        msgType : 'txt',
        dateTime: new Date().toLocaleString()
    };

    firebase.database().ref('chatMessage').child(chatKey).push(chatMessage, function (error) {
        if (error) alert(error);
        else {
            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();

        }
    });
}

function chooseImages() {
    document.getElementById('imageFile').click();
}

function sendImage(event) {
    var file = event.files[0];

    if (!file.type.match("image.*")) {
        alert("Please Select Images..")
    }
    else {
        var reader = new FileReader();
        reader.addEventListener("load", function () {
            var chatMessage = {
                userId: currentUserKey,
                msg: reader.result,
                msgType : 'image',
                dateTime: new Date().toLocaleString()
            };

            firebase.database().ref('chatMessage').child(chatKey).push(chatMessage, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('txtMessage').value = '';
                    document.getElementById('txtMessage').focus();
                }
            });
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }
}


function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);

}

function signout() {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

var user_data;
function onStateChanged(user) {
    if (user) {
        user_data = user;
        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = user.email;
        userProfile.name = user.displayName;
        userProfile.photoURL = user.photoURL;

        var db = firebase.database().ref('users');
        var temp = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    temp = true;
                    currentUserKey = data.key;
                }
            });
            if (temp === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else {
                document.getElementById('profile').src = user.photoURL;
                document.getElementById('profile').title = user.displayName;
                document.getElementById('main').style = 'display:none';
                document.getElementById('chat').style = '';
            }
            loadChatlist();
        });
    }
    else {
        document.getElementById('profile').src = '/Images/User.png';
        document.getElementById('profile').title = '';

        document.getElementById('chat').style = 'display:none';
        document.getElementById('main').style = '';

    }
}
onFirebaseStateChanged();

function callback(error) {
    if (error) {
        alert(error);
    }
    else {
        document.getElementById('profile').src = user_data.photoURL;
        document.getElementById('profile').title = user_data.displayName;
        document.getElementById('main').style = 'display:none';
        document.getElementById('chat').style = '';
    }
}

function showFriendList() {
    document.getElementById('listFriend').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-success mt-5" style="width:5rem ; height:5rem"></span>
                                                    </div>`;

    var db = firebase.database().ref('users');
    var list = '';
    db.on('value', function (users) {
        if (users.hasChildren()) {
            list = `<li class="list-group-item" style="background-color : rgb(235, 230, 230)">
                <input type="text" placeholder= "Search or New Chat" class="form-control search">
                </li>`;
        }

        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== user_data.email) {
                list += `<li style="cursor : pointer" class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${user.photoURL}"  alt="" class="friend-pic rounded-circle"> 
                            </div>
                            <div class="col-md-10" style="cursor: pointer;">
                                <div class="name">${user.name}</div>
                            </div>
                        </div>
                    </li>`;
            }

        });
        document.getElementById('listFriend').innerHTML = list;
    });

}

function loadChatlist() {
    var db = firebase.database().ref('friendList');
    db.on('value', function (lists) {
        document.getElementById('listChat').innerHTML = ` <li class="list-group-item" style="background-color : rgb(235, 230, 230)">
        <input type="text" placeholder="Search or New Chat" class="form-control search">
     </li>
        `;
        lists.forEach(function (data) {
            var list = data.val();
            var friendKey = '';
            if (list.friendId === currentUserKey) {
                friendKey = list.userId;
            }
            else if (list.userId === currentUserKey) {
                friendKey = list.friendId;
            }

            if (friendKey !== "") {

                firebase.database().ref('users').child(friendKey).on('value', function (data) {
                    var user = data.val();
                    document.getElementById('listChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                <div class="row">
                    <div class="col-1 col-sm-1 col-md-2">
                        <img src="${user.photoURL}" alt="" class="friend-pic rounded-circle">
                    </div>
                    <div class=" col-8 col-sm-9 col-md-10 pl-5 " style="cursor: pointer;">
                        <span class="name">${user.name}</span>
                        
                    </div>
                </div>
            </li>`;
                });
            }
        });
    });
}

// $(document).ready(function(){
//     $("#txtMessage").emojioneArea({
//         // saveEmojisAs: "shortname"
//     });
// });