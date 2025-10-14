function validateForm() {
    document.getElementById("cardError").textContent = "";
    document.getElementById("numbersError").textContent = "";

    const card_id = document.forms["roundForm"]["card_id"].value.trim();
    const round_numbers = document.forms["roundForm"]["ticket_numbers"].value
        .split(',')
        .map(n => n.trim())
        .filter(n => n !== '')
        .map(Number);

    let valid = true;

    if (card_id.length > 20) {
        document.getElementById("cardError").textContent = "Card ID must be less than 20 characters.";
        valid = false;
    } else if (isNaN(card_id)) {
        document.getElementById("cardError").textContent = "Card ID can only contain digits.";
        valid = false;
    }

    if (round_numbers.length < 6 || round_numbers.length > 10) {
        document.getElementById("numbersError").textContent = "You must enter between 6 and 10 numbers separated by commas.";
        valid = false;
    } else {
        for (let i = 0; i < round_numbers.length; i++) {
            if (isNaN(round_numbers[i]) || round_numbers[i] < 1 || round_numbers[i] > 45) {
                document.getElementById("numbersError").textContent = "Numbers must be between 1 and 45.";
                valid = false;
                break;
            }
        }
        const unique_numbers = new Set(round_numbers);
        if (unique_numbers.size !== round_numbers.length) {
            document.getElementById("numbersError").textContent = "Numbers must not repeat.";
            valid = false;
        }
    }

    return valid;
}
