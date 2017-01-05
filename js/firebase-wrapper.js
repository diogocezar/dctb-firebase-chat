FirebaseWrapper = {
    Connect : {
        init: function(){
            firebase.initializeApp(Config);
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
        },
        sendFile: function(file, callBack){
            var filename   = file.name;
            var storageRef = firebase.storage().ref('/images/' + filename);
            var uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', function(snapshot){
                //console.log(snapshot);
            }, function(error){
                Debug.error([error.code, error.message]);
            }, function() {
                var downloadURL = uploadTask.snapshot.downloadURL;
                if(!Utils.__is_empty(callBack))
                    callBack(downloadURL);
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