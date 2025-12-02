function enableSubmission(submissionButtonId, enable) {
    $(submissionButtonId).prop("disabled", !enable);
}

function appendFormulaParser(inputId, inputDivId, submissionButtonId, referenceArray, okIconClass, errorIconClass, errorIfNull) {
    inputId = "#" + inputId;
    $(inputId).css("padding-left", "23px");
    inputDivId = "#" + inputDivId;
    let targetDiv = $(inputDivId);
    let span = '<span class="input-group-append jsep-notification"><i class="text-success ok ' + okIconClass + '"></i><i class="text-danger error ' + errorIconClass + '"></i></span>';
    targetDiv.append(span);
    $('.jsep-container').append('<span id="validationMessage" class="text-danger" style="display: none;"></span>');
    checkIdentifiers($(inputId).val(), inputId, submissionButtonId, referenceArray, errorIfNull)
}

function checkIdentifiers(formula, inputId, submissionButtonId, referenceArray, errorIfNull) {
    let validationMessageId = "#validationMessage";

    function formatError(message, inputId, validationMessageId, submissionButtonId) {
        $('.jsep-notification').removeClass('ok').addClass('error');
        $('.jsep-notification').removeClass('valid').addClass('invalid');
        $('.jsep-notification').css("top", "7px");
        $(inputId).removeClass('border-primary').addClass('border-danger');
        $('.ok').css("display", "none");
        $('.error').css("display", "block");
        $(validationMessageId).text(message);
        $(validationMessageId).css("display", "block");
        enableSubmission(submissionButtonId, false);

        return false;
    }

    if (formula !== undefined && formula !== null && formula.length > 0) {
        try {
            function getAllIdentifiers(obj) {
                let values = [];

                function search(currentObj) {
                    for (const k in currentObj) {
                        if (currentObj.hasOwnProperty(k)) {
                            if (k === 'type' && currentObj.type == "Identifier") {
                                values.push(currentObj.name);
                            }

                            if (typeof currentObj[k] === 'object' && currentObj[k] !== null) {
                                search(currentObj[k]);
                            }
                        }
                    }
                }

                search(obj);

                return values;
            }

            let parsedFormula = jsep(formula);
            $('.jsep-notification').removeClass('error').addClass('ok');
            $('.jsep-notification').removeClass('invalid').addClass('valid');
            $('.jsep-notification').css("top", "7px");
            $('.ok').css("display", "block");
            $('.error').css("display", "none");
            let arrayToBeChecked = getAllIdentifiers(parsedFormula);
            let check = arrayToBeChecked.every(element => referenceArray.includes(element));

            if (check) {
                $('.jsep-notification').css("top", "10px");
                $(validationMessageId).css("display", "none");
                $(inputId).removeClass('border-danger').addClass('border-primary');
                enableSubmission(submissionButtonId, true);
                return true;
            }

            return formatError('One or more variables are invalid', inputId, validationMessageId, submissionButtonId);
        } catch (e) {
            return formatError(e.message, inputId, validationMessageId, submissionButtonId);
        }
    } else {
        return !errorIfNull || formatError('Formula cannot be null or empty', inputId, validationMessageId, submissionButtonId);
    }
}

function formulaInput(inputId, submissionButtonId, variables, errorIfNull) {
    inputId = "#" + inputId;
    submissionButtonId = "#" + submissionButtonId;
    $(inputId).prop("placeholder", "ex: 1 + 2 - 3");
    $(inputId).prop('required', true);

    function split(val) {
        return val.split(/ \s*/);
    }

    $(inputId)
        .on("input", function (event) {
            if (event.key === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }

            checkIdentifiers($(inputId).val(), inputId, submissionButtonId, variables);
        })
        .autocomplete({
            minLength: 2,
            source: function (request, response) {
                response($.ui.autocomplete.filter(
                    variables, split(request.term).pop()));
            },
            focus: function () {
                return false;
            },
            select: function (event, ui) {
                var terms = split(this.value);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(" ");
                checkIdentifiers(this.value, inputId, submissionButtonId, variables);
                return false;
            }
        });
}