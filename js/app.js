Utils = {
    __is_empty: function(val){
        return (val == "" || val == null || val == undefined);
    },
    __format_date: function(date){
        if(!Utils.__is_empty(date)){
            var d  = new Date(date),
            month  = '' + (d.getMonth() + 1),
            day    = '' + d.getDate(),
            year   = '' + d.getFullYear(),
            hour   = '' + d.getHours(),
            minute = '' + d.getMinutes(),
            second = '' + d.getSeconds();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            if (hour.length < 2) hour = '0' + hour;
            if (minute.length < 2) minute = '0' + minute;
            if (second.length < 2) second = '0' + second;
            var date = [day, month, year].join('/');
            var time = [hour, minute, second].join(':');
            return date +  " " + time;
        }
        else{
            return false;
        }
    }
};

Debug = {
    debugMode : false,
    constant  : '[DCTB] ',
    log: function(msg){
        if(Debug.debugMode)
            console.log(Debug.constant + msg);
    },
    error: function(msg){
        if(Debug.debugMode)
            console.error(Debug.constant + msg);
    },
    info: function(msg){
        if(Debug.debugMode)
            console.info(Debug.constant + msg);
    }
};

FirebaseWrapper = {
    Config : {
        apiKey            : "",
        authDomain        : "",
        databaseURL       : "",
        storageBucket     : "",
        messagingSenderId : ""
    },
    Connect : {
        init: function(){
            firebase.initializeApp(FirebaseWrapper.Config);
        }
    },
    Login : {
        facebook: function(callBack){
            firebase.auth().onAuthStateChanged(function(user){
                if (!user){
                    var provider = new firebase.auth.FacebookAuthProvider();
                    provider.addScope('email');
                    provider.addScope('user_about_me');
                    firebase.auth().signInWithPopup(provider).then(function(result){
                        if(!Utils.__is_empty(callBack))
                            callBack(result.user);
                    }).catch(function(error){
                        if(!Utils.__is_empty(callBack))
                            callBack(false, error);
                    });
                }
                else{
                    if(!Utils.__is_empty(callBack))
                        callBack(user);
                }
            });
        }
    },
    Data : {
        inspect: function(uri, callBack){
            var ref = firebase.database().ref(uri);
            ref.on('value', function(snapshot){
                callBack(snapshot.val());
            });
        },
        get: function(uri, callBack){
            var ref = firebase.database().ref(uri);
            ref.once('value', function(snapshot){
                callBack(snapshot.val());
            }).catch(function(error){
                Debug.error([error.code, error.message]);
            });
        },
        set: function(uri, data, callBack){
            var ref = firebase.database().ref(uri);
            ref.once('value').then(function(snapshot){
                var max = parseInt(snapshot.numChildren());
                firebase.database().ref(uri + '/' + (max++)).set(data);
                if(!Utils.__is_empty(callBack))
                    callBack();
            }).catch(function(error){
                Debug.error([error.code, error.message]);
            });
        }
    },
    User: {
        user : null,
        get: function(){
            return FirebaseWrapper.User.user;
        },
        set: function(user){
            FirebaseWrapper.User.user = user;
        },
        getPicture: function(){
            return FirebaseWrapper.User.user['photoURL'];
        },
        getEmail: function(){
            return FirebaseWrapper.User.user['email'];
        }
    }
};

Chat = {
    user : null,
    init: function(){
        FirebaseWrapper.Connect.init();
        Chat.Login.go();
        Chat.Send.setButtons();
        Chat.Send.setKeyPess();
    },
    Login: {
        go: function(){
            $(".message-alert").empty().html("Carregando...");
            $(".login-facebook").hide();
            FirebaseWrapper.Login.facebook(function(user, error){
                if(!Utils.__is_empty(user)){
                    FirebaseWrapper.User.set(user);
                    Chat.Messages.inspect();
                }
                else{
                    if(error.code == "auth/popup-closed-by-user"){
                        $(".message-alert").empty().html("Você precisa logar com o Facebook para acessar o chat.");
                        $(".login-facebook").show();
                    }
                }
            });
        }
    },
    Send: {
        setButtons: function(){
             $('.send_message').on('click', function(){ Chat.Send.go(); });
             $('.login-facebook').on('click', function(){ Chat.Login.go(); })
        },
        setKeyPess: function(){
            $('.message_input').on('keyup', function(e){
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code==13)
                    Chat.Send.go();
             })
        },
        go: function(){
            var msg = $('.message_input').val();
            if(!Utils.__is_empty(msg)){
                data = {
                    'email'   : FirebaseWrapper.User.getEmail(),
                    'picture' : FirebaseWrapper.User.getPicture(),
                    'msg'     : msg,
                    'when'    : new Date().toString()
                };
                FirebaseWrapper.Data.set('chat', data, function(){
                    $('.message_input').val("");
                    $('.message_input').focus();
                    Chat.Messages.scollBottom();
                });
            }
        }
    },
    Messages : {
        add: function(msg, email, picture, when){
            var side  = (email == FirebaseWrapper.User.getEmail()) ? 'left' : 'right';
            var clone = $($('.message_template').clone().html());
            clone.addClass(side);
            clone.find('.email').html(email);
            clone.find('.text').html(msg);
            clone.find('.when').html(Utils.__format_date(when));
            clone.find('.img-avatar').attr('src', picture);
            clone.addClass('appeared');
            $('.messages').append(clone);
        },
        inspect: function(){
            FirebaseWrapper.Data.inspect('chat', function(snapshot){
                Chat.Messages.plot(snapshot);
            })
        },
        plot: function(items){
            $('.messages').empty();
            for(var i=0; i<items.length; i++){
                Chat.Messages.add(items[i].msg, items[i].email, items[i].picture, items[i].when);
            }
            Chat.Messages.scollBottom();
        },
        scollBottom: function(){
            $(".messages").scrollTop($(".messages")[0].scrollHeight);
        }
    }
};

$(document).ready(function() {
    Chat.init();
});