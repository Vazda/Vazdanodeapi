

const checkEmailFormat = async (email) => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.toString().toLowerCase());
}

const urgencyName = (urgencyId) => {
    switch (urgencyId) {
        case 1:
            return 'Very low';
        case 2:
            return 'Low';
        case 3:
            return 'Standard';
        case 4:
            return 'High';
        case 5:
            return 'Critical';
        default:
            return 'none';
    }
}

const ratingName = (rating) => {
    switch (rating) {
        case 1:
            return '1 star';
        case 2:
            return '2 star';
        case 3:
            return '3 stars';
        case 4:
            return '4 stars';
        case 5:
            return '5 stars';
        default:
            return 'none';
    }
}

export default {
    checkEmailFormat, urgencyName, ratingName
}