export default {
    BCPHN: function(phn) {
        // healthnetBC
        // http://www2.gov.bc.ca/assets/gov/health/practitioner-pro/software-development-guidelines/app_d.pdf
        // Test number: 0009123947241
        let match = phn.match(/^0*9(\d{8})(\d)$/);
        if(!match) {
            return false;
        }
        let digits = match[1];
        let checkDigit = parseInt(match[2],10);
        const weights = [2,4,8,5,10,9,7,3];
        let sum = 0;
        for(let i=0; i<weights.length; ++i) {
            let value = parseInt(digits[i],10) * weights[i];
            sum += value % 11;
        }
        let rem = sum % 11;
        return 11 - rem === checkDigit;
    },
    ONPHN: function(phn) {
        // OHIP
        // http://www.health.gov.on.ca/english/providers/pub/ohip/tech_specific/pdf/5_13.pdf
        // https://en.wikipedia.org/wiki/Luhn_algorithm
        // Test number: 9876543217
        let match = phn.match(/^([1-9]\d{8})(\d)(?:[A-Z]{2})?$/i);
        if(!match) {
            return false;
        }
        let digits = match[1];
        let checkDigit = parseInt(match[2],10);

        let sum = 0;
        for(let i=0; i<digits.length; ++i) {
            let digit = parseInt(digits[i],10);
            if(i%2 === 0) {
                let double = digit * 2;
                sum += double >= 10 ? sumOfDigits(double) : double;
            } else {
                sum += digit;
            }
        }
        let rem = sum % 10;
        return 10 - rem === checkDigit;
    },
};


function sumOfDigits(num) {
    return String(num).split('').map(x => parseInt(x,10)).reduce((a,b) => a + b, 0);
}
