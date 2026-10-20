import foglalasokData from './foglalasok.json' with { type: 'json' };

let foglalasok = JSON.parse(JSON.stringify(foglalasokData));

const table = document.getElementById("table");
const kartyak = document.getElementById("kartyak");
const kategoria = document.getElementById("kategoria");
const rendezes = document.getElementById("rendezes");
const radioGombok = document.querySelectorAll('input[name="nezet"]');
const rendezesKategoria = document.getElementById("rendezesKategoria");

const keresoNev = document.getElementById("keresoNev");
const szuroSzallas = document.getElementById("szuroSzallas");

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

function tablazat_feltoltese(adatok) {
    let html = "";
    let kulcsok = [];

    if (adatok.length > 0) {
        for (let kulcs in adatok[0]) {
            kulcsok.push(kulcs);
        }
    }

    html += "<thead><tr>";
    for (let k = 0; k < kulcsok.length; k++) {
        html += `<th>${kulcsok[k]}</th>`;
    }
    html += "<th>Műveletek</th>";
    html += "</tr></thead>";

    html += "<tbody>";
    for (let i = 0; i < adatok.length; i++) {
        const elem = adatok[i];

        if (elem.statusz !== "Aktív") continue;

        const ertekek = Object.values(elem);

        html += "<tr>";
        for (let j = 0; j < ertekek.length; j++) {
            html += `<td>${ertekek[j]}</td>`;
        }
        html += `<td><button class="btn-torles" onclick="torles(${elem.id})">Törlés</button></td>`;
        html += "</tr>";
    }
    html += "</tbody>";

    table.innerHTML = html;
}

function kartyak_feltoltese(adatok) {
    let html = "";

    for (let i = 0; i < adatok.length; i++) {
        const elem = adatok[i];

        if (elem.statusz !== "Aktív") continue;

        html += `
            <div class="kartya">
                <h3>${elem.szallas_nev}</h3>
                <p><strong>Vendég:</strong> ${elem.vendeg_nev}</p>
                <p><strong>Időtartam:</strong> ${elem.erkezes} - ${elem.tavozas}</p>
                <p><strong>Vendégek:</strong> ${elem.vendeg_szam} fő</p>
                <p><strong>Végösszeg:</strong> ${elem.vegosszeg.toLocaleString()} Ft</p>
                <button class="btn-torles" onclick="torles(${elem.id})">Törlés</button>
            </div>
        `;
    }

    kartyak.innerHTML = html;
}

function megjelenit() {
    let kivalasztottNezet = document.querySelector('input[name="nezet"]:checked').value;

    if (kivalasztottNezet === "tablazat") {
        table.style.display = "table";
        kartyak.style.display = "none";
        rendezesKategoria.style.display = "block";
    }
    else {
        table.style.display = "none";
        kartyak.style.display = "grid";
        rendezesKategoria.style.display = "none";
    }
}

function szures() {
    let nevSzoveg = keresoNev.value.toLowerCase();
    let szallasErtek = szuroSzallas.value;

    let szurtAdatok = foglalasok.filter(function (elem) {
        let nevEgyezik = elem.vendeg_nev.toLowerCase().includes(nevSzoveg);
        let szallasEgyezik = (szallasErtek === "" || elem.szallas_nev === szallasErtek);

        return nevEgyezik && szallasEgyezik;
    });

    tablazat_feltoltese(szurtAdatok);
    kartyak_feltoltese(szurtAdatok);
}

window.torles = function (id) {
    for (let i = 0; i < foglalasok.length; i++) {
        if (foglalasok[i].id === id) {
            foglalasok[i].statusz = "Törölve";
            break;
        }
    }
    szures();
}

function rendezesAdatait() {
    let kivalasztottKulcs = kategoria.value;

    foglalasok.sort(function (a, b) {
        let ertekA = a[kivalasztottKulcs];
        let ertekB = b[kivalasztottKulcs];

        if (typeof ertekA === "string") {
            if (ertekA < ertekB) return -1;
            if (ertekA > ertekB) return 1;
            return 0;
        }
        else {
            return ertekA - ertekB;
        }
    });

    szures();
}

rendezes.addEventListener("click", rendezesAdatait);
keresoNev.addEventListener("input", szures);
szuroSzallas.addEventListener("change", szures);

for (let i = 0; i < radioGombok.length; i++) {
    radioGombok[i].addEventListener("change", megjelenit);
}

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
});

scrollBtn.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

legorduloFeltoltese();
szures();
megjelenit();