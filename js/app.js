App = {
    user         : null,
    selectedFile : null,
    disabled     : false,
    path         : 'chat',
    init: function(){
        FirebaseWrapper.Connect.init();
        App.Login.go();
        App.Send.setButtons();
        App.Send.setKeyPess();
        App.Send.setChangeFile();
    },
    Login: {
        go: function(){
            $(".message-alert").empty().html("Carregando...");
            $(".login-facebook").hide();
            FirebaseWrapper.Login.facebook(function(user, error){
                if(!Utils.__is_empty(user)){
                    FirebaseWrapper.User.set(user);
                    App.Messages.inspect();
                }
                else{
                    if(error.code == "auth/popup-closed-by-user"){
                        $(".message-alert").empty().html("Você precisa logar com o Facebook para acessar o App.");
                        $(".login-facebook").show();
                    }
                }
            });
        }
    },
    Send: {
        setButtons: function(){
             $('.send_message').on('click', function(){ App.Send.go(); });
             $('.login-facebook').on('click', function(){ App.Login.go(); });
             $('.file_upload_icon').on('click', function(){
                if(!App.disabled)
                    $(".file_upload").trigger('click');
            });
        },
        setKeyPess: function(){
            $('.message_input').on('keyup', function(e){
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code==13)
                    App.Send.go();
             })
        },
        setChangeFile: function(){
            $(".file_upload").on("change", function(event){
                App.selectedFile = event.target.files[0];
                $('.file_upload_icon').addClass('selected');
            });
        },
        go: function(){
            var msg = $('.message_input').val();
            if(!Utils.__is_empty(msg) && !App.disabled){
                App.Messages.disable();
                data = {
                    'email'   : FirebaseWrapper.User.getEmail(),
                    'picture' : FirebaseWrapper.User.getPicture(),
                    'msg'     : msg,
                    'when'    : new Date().toString()
                };
                if(!Utils.__is_empty(App.selectedFile)){
                    FirebaseWrapper.Data.sendFile(App.selectedFile, function(url_file){
                        data['url_file'] = url_file;
                        FirebaseWrapper.Data.set(App.path, data, function(){
                            App.Messages.update();
                        });
                    })
                }
                else{
                    FirebaseWrapper.Data.set(App.path, data, function(){
                        App.Messages.update();
                    });
                }
            }
        }
    },
    Messages : {
        add: function(msg, email, picture, when, url_file){
            var side  = (email == FirebaseWrapper.User.getEmail()) ? 'left' : 'right';
            var clone = $($('.message_template').clone().html());
            clone.addClass(side);
            clone.find('.email').html(email);
            clone.find('.text').html(msg);
            clone.find('.when').html(Utils.__format_date(when));
            clone.find('.img-avatar').attr('src', picture);
            if(!Utils.__is_empty(url_file)){
                clone.find('.img-file').attr('src', url_file);
                clone.find('.img-file').css({'display' : 'block'});
            }
            clone.addClass('appeared');
            $('.messages').append(clone);
        },
        inspect: function(){
            FirebaseWrapper.Data.inspect(App.path, function(snapshot){
                App.Messages.plot(snapshot);
            })
        },
        plot: function(items){
            $('.messages').empty();
            for(var i=0; i<items.length; i++){
                App.Messages.add(items[i].msg, items[i].email, items[i].picture, items[i].when, items[i].url_file);
            }
            App.Messages.scollBottom();
        },
        scollBottom: function(){
            $(".messages").scrollTop($(".messages")[0].scrollHeight);
        },
        update: function(){
            App.selectedFile = null;
            $('.file_upload_icon').removeClass('selected');
            $(".file_upload").val("");
            $('.message_input').val("");
            $('.message_input').focus();
            App.Messages.scollBottom();
            App.Messages.enable();
        },
        disable: function(){
            $('.message_input').val("");
            $('.message_input').attr('placeHolder', "Aguarde...");
            $('.message_input').prop('disabled', true);
            App.disabled = true;
        },
        enable: function(){
            $('.message_input').attr('placeHolder', "Digite a sua mensagem...");
            $('.message_input').prop('disabled', false);
            App.disabled = false;
        }
    }
};

$(document).ready(function() {
    App.init();
});