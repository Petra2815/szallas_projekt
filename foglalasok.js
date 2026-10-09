import foglalasok from './foglalasok.json' with { type: 'json' };


//Táblázatos feltöltés
const table = document.getElementById("table");
const kartyak = document.getElementById("kartyak");
const kategoria = document.getElementById("kategoria");
const rendezes = document.getElementById("rendezes");
const radioGombok = document.querySelectorAll('input[name="nezet"]');

function legorduloFeltoltese() {
    if (foglalasok.length === 0) return;

    const kulcsok = Object.keys(foglalasok[0]);
    kategoria.innerHTML = "";

    for (let i = 0; i < kulcsok.length; i++) {
        const option = document.createElement("option");
        option.value = kulcsok[i];
        option.textContent = kulcsok[i];
        kategoria.appendChild(option);
    }
}

function tablazat_feltoltese(foglalasok) {
    let html = "";
    let kulcsok = [];

    if (foglalasok.length > 0) {
        const elsoElem = foglalasok[0];
        for (let kulcs in elsoElem) {
            kulcsok.push(kulcs);
        }
    }

    html += "<thead><tr>";
    for (let k = 0; k < kulcsok.length; k++) {
        html += `<th>${kulcsok[k]}</th>`;
    }
    html += "</tr></thead>";
    html += "<tbody>";
    for (let i = 0; i < foglalasok.length; i++) {
        const elem = foglalasok[i];
        const ertekek = Object.values(elem);

        html += "<tr>";
        for (let j = 0; j < ertekek.length; j++) {
            html += `<td>${ertekek[j]}</td>`;
        }
        html += "</tr>";
    }
    html += "</tbody>";

    table.innerHTML = html;
}

//Kártyás feltöltés
//



//Nézetváltás
function megjelenit() {
    let kivalasztottNezet = document.querySelector('input[name="nezet"]:checked').value;

    if (kivalasztottNezet == "tablazat") {
        table.style.display = "table";
    }
    else {
        table.style.display = "none";
    }
}

//Adatok rendezése
function rendezesAdatait() {
    let kivalasztottKulcs = kategoria.value;

    foglalasok.sort(function(a, b) {
        let ertekA = a[kivalasztottKulcs];
        let ertekB = b[kivalasztottKulcs];

        if (typeof ertekA === "string") {
            if (ertekA < ertekB) {
                return -1;
            }
            if (ertekA > ertekB) {
                return 1;
            }
            return 0;
        } 
        else {
            return ertekA - ertekB;
        }
    });

    tablazat_feltoltese(foglalasok);
}

rendezes.addEventListener("click", () => {
    rendezesAdatait();
});

for (let i = 0; i < radioGombok.length; i++) {
    radioGombok[i].addEventListener("change", megjelenit);
}

legorduloFeltoltese();
tablazat_feltoltese(foglalasok);
megjelenit();


