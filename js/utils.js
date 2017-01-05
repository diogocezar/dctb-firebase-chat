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