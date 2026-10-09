import szallasok from './szallasok.json' with { type: 'json' };
import marFoglaltIdopontok from './foglalasok.json' with { type: 'json' };

const szallasSelect = document.getElementById('szallasSelect');
const erkezesInput = document.getElementById('erkezes');
const tavozasInput = document.getElementById('tavozas');
const vendegSzamInput = document.getElementById('vendegSzam');
const bookingForm = document.getElementById('bookingForm');

const MAX_EJSZAKAK = 14; 

const maiDatum = new Date().toISOString().split('T')[0];
erkezesInput.min = maiDatum;
tavozasInput.min = maiDatum;

szallasok.forEach(szallas => {
    const option = document.createElement('option');
    option.value = szallas.id;
    option.textContent = `${szallas.nev} (${szallas.ar_ejszakankent.toLocaleString()} Ft / fő / éj, max ${szallas.ferohely} fő)`;
    szallasSelect.appendChild(option);
});

function frissitMezoKorlatokat() {
    const szallasId = parseInt(szallasSelect.value);
    const valasztottSzallas = szallasok.find(s => s.id === szallasId);

    if (valasztottSzallas) {
        vendegSzamInput.max = valasztottSzallas.ferohely;

        if (parseInt(vendegSzamInput.value) > valasztottSzallas.ferohely) {
            vendegSzamInput.value = valasztottSzallas.ferohely;
        }
    } else {
        vendegSzamInput.removeAttribute('max');
    }

    if (erkezesInput.value) {
        const erkezesDate = new Date(erkezesInput.value);

        const minTavozas = new Date(erkezesDate);
        minTavozas.setDate(minTavozas.getDate() + 1);
        const minStr = minTavozas.toISOString().split('T')[0];
        tavozasInput.min = minStr;

        const maxTavozas = new Date(erkezesDate);
        maxTavozas.setDate(maxTavozas.getDate() + MAX_EJSZAKAK);
        const maxStr = maxTavozas.toISOString().split('T')[0];
        tavozasInput.max = maxStr;

        if (tavozasInput.value && tavozasInput.value < minStr) {
            tavozasInput.value = minStr;
        } else if (tavozasInput.value && tavozasInput.value > maxStr) {
            tavozasInput.value = maxStr;
        }
    } else {
        tavozasInput.removeAttribute('max');
    }
}

function szamolAr() {
    const szallasId = parseInt(szallasSelect.value);
    const erkezesVal = erkezesInput.value;
    const tavozasVal = tavozasInput.value;
    const vendegSzam = parseInt(vendegSzamInput.value) || 1;

    const valasztottSzallas = szallasok.find(s => s.id === szallasId);

    if (!valasztottSzallas || !erkezesVal || !tavozasVal) {
        document.getElementById('ejszakakDisplay').textContent = "0";
        document.getElementById('egysegArDisplay').textContent = valasztottSzallas ? valasztottSzallas.ar_ejszakankent.toLocaleString() : "0";
        document.getElementById('vegosszegDisplay').textContent = "0";
        return 0;
    }

    const d1 = new Date(erkezesVal);
    const d2 = new Date(tavozasVal);
    const idokulonbseg = d2.getTime() - d1.getTime();
    const ejszakak = Math.ceil(idokulonbseg / (1000 * 3600 * 24));

    if (ejszakak > 0) {
        const vegosszeg = ejszakak * valasztottSzallas.ar_ejszakankent * vendegSzam;
        document.getElementById('ejszakakDisplay').textContent = ejszakak;
        document.getElementById('egysegArDisplay').textContent = valasztottSzallas.ar_ejszakankent.toLocaleString();
        document.getElementById('vegosszegDisplay').textContent = vegosszeg.toLocaleString();
        return vegosszeg;
    } else {
        document.getElementById('ejszakakDisplay').textContent = "0";
        document.getElementById('egysegArDisplay').textContent = valasztottSzallas.ar_ejszakankent.toLocaleString();
        document.getElementById('vegosszegDisplay').textContent = "0";
        return 0;
    }
}


szallasSelect.addEventListener('change', () => {
    frissitMezoKorlatokat();
    szamolAr();
});

erkezesInput.addEventListener('change', () => {
    frissitMezoKorlatokat();
    szamolAr();
});

tavozasInput.addEventListener('change', szamolAr);

vendegSzamInput.addEventListener('input', () => {
    const maxFerohely = parseInt(vendegSzamInput.max);
    if (maxFerohely && parseInt(vendegSzamInput.value) > maxFerohely) {
        vendegSzamInput.value = maxFerohely;
    }
    if (parseInt(vendegSzamInput.value) < 1 || !vendegSzamInput.value) {
        vendegSzamInput.value = 1;
    }
    szamolAr();
});

bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');

    const szallasId = parseInt(szallasSelect.value);
    const vendegNev = document.getElementById('vendegNev').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefon = document.getElementById('telefon').value.trim();
    const erkezes = erkezesInput.value;
    const tavozas = tavozasInput.value;
    const vendegSzam = parseInt(vendegSzamInput.value);

    let hibak = [];

    if (!szallasId || !vendegNev || !email || !telefon || !erkezes || !tavozas || !vendegSzam) {
        hibak.push("Minden mező kitöltése kötelező!");
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
        hibak.push("Kérjük, érvényes e-mail címet adjon meg!");
    }

    if (telefon && telefon.length < 8) {
        hibak.push("Kérjük, érvényes telefonszámot adjon meg!");
    }

    const ejszakak = (new Date(tavozas) - new Date(erkezes)) / (1000 * 3600 * 24);
    if (ejszakak <= 0) {
        hibak.push("A távozás dátumának későbbre kell esnie, mint az érkezés dátuma!");
    }

    if (ejszakak > MAX_EJSZAKAK) {
        hibak.push(`Egy foglalással legfeljebb ${MAX_EJSZAKAK} éjszaka foglalható!`);
    }

    const valasztottSzallas = szallasok.find(s => s.id === szallasId);
    if (valasztottSzallas && vendegSzam > valasztottSzallas.ferohely) {
        hibak.push(`A kiválasztott szállás maximális kapacitása ${valasztottSzallas.ferohely} fő!`);
    }

    if (valasztottSzallas && erkezes && tavozas && ejszakak > 0) {
        const atfedes = marFoglaltIdopontok.some(f => {
            return f.szallas_id === szallasId && (erkezes < f.tavozas && tavozas > f.erkezes);
        });

        if (atfedes) {
            hibak.push("A kiválasztott szállás a megadott időszakban már foglalt!");
        }
    }

    if (hibak.length > 0) {
        errorAlert.innerHTML = "<strong>Hiba történt a foglalás során:</strong><br>" + hibak.join("<br>");
        errorAlert.classList.remove('d-none');
    } else {
        const vegosszeg = szamolAr();

        marFoglaltIdopontok.push({
            szallas_id: szallasId,
            erkezes: erkezes,
            tavozas: tavozas
        });

        successAlert.innerHTML = `
            <h3>Sikeres foglalás!</h3>
            <p>Köszönjük a foglalást, <strong>${vendegNev}</strong>!</p>
            <p><strong>A foglalás részletei:</strong></p>
            <ul>
                <li>Szállás: ${valasztottSzallas.nev}</li>
                <li>Időtartam: ${erkezes} - ${tavozas} (${ejszakak} éjszaka)</li>
                <li>Vendégek száma: ${vendegSzam} fő</li>
                <li>Fizetendő végösszeg: ${vegosszeg.toLocaleString()} Ft</li>
                <li>E-mail: ${email}</li>
                <li>Telefonszám: ${telefon}</li>
            </ul>
        `;
        successAlert.classList.remove('d-none');
        bookingForm.reset();
        frissitMezoKorlatokat();
        szamolAr();
    }
});