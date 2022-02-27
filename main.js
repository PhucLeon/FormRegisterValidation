function Validator(options) {
    
    var formElement = document.querySelector(options.form);
    
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        } 
    }
    
    var selectorRules = {};

    function validate(inputElement, rule) {
        // get form-group element to display error message
        // var errorElement = inputElement.parentElement.querySelector('.form-message')

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
        var errorMessage;

        var rules = selectorRules[rule.selector];
    
        for(var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        
        return !errorMessage;
    }

    if(formElement) {
        // when submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            // Submit form
            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            });
            
            if (isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])') 
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});
                    options.onSubmit(formValues)
                } else {
                    formElement.submit();
                }
            }
        }

        // Loop all rule and execute...
        options.rules.forEach(function (rule) {
            // get selector
            var inputElement = formElement.querySelector(rule.selector);

            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test); 
            } else {
                selectorRules[rule.selector] = [rule.test]; 
            }

            if (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }
            }

            inputElement.oninput = function() {
                var errorElement = inputElement.parentElement.querySelector('.form-message')
                errorElement.innerText = '';
                inputElement.parentElement.classList.remove('invalid');
            }
        })
    }
}

Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : 'Please enter this field';
        }
    }
}

Validator.isEmail = function (selector) {
    return  {
        selector: selector,
        test: function(value) {
            var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : 'You must enter the email in this fields';

        }
    }
}

Validator.minLength = function (selector, min) {
    return  {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : 'Password must equal or greater than 6';
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return  {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Property enter is incorrect';
        }
    }
}


