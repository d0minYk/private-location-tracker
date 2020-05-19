class Utilities {

    static shorten(str, maxLen, separator = ' ') {
        if (str.length <= maxLen) return str;
        return str.substr(0, str.lastIndexOf(separator, maxLen)) + " ...";
    }

    static shortenToChar(str, maxLen) {
        if (str.length <= maxLen) return str;
        return str.substr(0, maxLen);
    }

    static formatDate(dateObj, format) {

    	var str = new Date();

    	if (dateObj !== undefined) {
    		str = new Date(dateObj);
    	}

    	var dateStr = "";
    	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    	var months;
    	var days;
    	var years;
    	var hours;
    	var minutes;

    	switch (format) {

            case "DD/MM/YY":
    			months = (str.getMonth()+1);
    			days = (str.getDate());
    			years = str.getFullYear();
    			if (months < 10) months = "0" + months
    			if (days < 10) days = "0" + days
    			dateStr = days + "/" + months + "/" + (years + "").substr(0, 2);
    			break

            case "HH:MM DD/MM/YYYY":
                months = (str.getMonth()+1);
                days = (str.getDate());
                years = str.getFullYear();
                if (months < 10) months = "0" + months
                if (days < 10) days = "0" + days
                hours = str.getHours()
                minutes = str.getMinutes()
                if (hours < 10) hours = "0" + hours;
                if (minutes < 10) minutes = "0" + minutes
                dateStr = hours + ":" + minutes + " " + days + "/" + months + "/" + years;
                break;

            case "mm DD":
                months = monthNames[(str.getMonth())];
                days = (str.getDate());
                if (days < 10) days = "0" + days
                dateStr = months + " " + days;
                break;

    		default:
    			months = (str.getMonth()+1);
    			if (months < 10) months = "0" + months
    			years = str.getFullYear();
    			if (years < 10) years = "0" + years
    			days = (str.getDate());
    			if (days < 10) days = "0" + days
    			hours = str.getHours()
    			if (hours < 10) hours = "0" + hours
    			minutes = str.getMinutes()
    			if (minutes < 10) minutes = "0" + minutes
    			dateStr = years + "-" + months + "-" + days + " " + hours + ":" + minutes
    			break;

    	}

    	return dateStr;

    }

}

export default Utilities;
