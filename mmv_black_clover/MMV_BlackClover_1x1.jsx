// MMV_BlackClover_1x1.jsx  -  Auto-assemble edit MMV 1:1 yang sinkron dengan sound
// ES3-safe (tanpa const/let/arrow/template literal). Tes target: After Effects 2022-2026.
//
// Alur:
//  1. Jalankan beat_sync.py pada sound -> menghasilkan <sound>_markers.txt
//  2. AE: File > Scripts > Run Script File... > pilih skrip ini
//  3. Pilih: (a) file markers.txt, (b) file audio, (c) folder panel/klip (urut nama: 01_xxx.png, 02_xxx.png ...)
//  4. Skrip membuat comp 1080x1080 30fps, menaruh tiap panel di setiap cut (tiap N ketukan, DROP selalu jadi cut),
//     plus rig 2.5D (kamera sway), FLASH & SHAKE otomatis di marker IMPACT/DROP, grade MMV, teks judul & watermark.
(function () {
    var CFG = {
        compName: "MMV_BC_1x1",
        size: 1080,
        fps: 30,
        beatsPerShot: 2,          // phonk/hype = 1-2, achievement = 4, sad = 8
        overscan: 1.10,           // 110% agar shake/sway tidak memunculkan tepi hitam
        pushIn: 7,                // % zoom pelan per shot (Ken Burns)
        shakePx: 26,              // kekuatan shake di IMPACT
        flashMax: 85,             // opacity flash putih di IMPACT (0 = mati)
        titleText: "BEST MOMENT",
        labelText: "ASTA",        // ganti: NOELLE SILVA / YAMI SUKEHIRO / dll
        watermark: "@channelmu",
        accent: [1.0, 0.18, 0.12] // merah anti-magic; emas = [1,0.8,0.2], hijau Yuno = [0.2,1,0.6]
    };

    function trim(s) { return s.replace(/^\s+|\s+$/g, ""); }

    function readMarkers(f) {
        var out = [];
        if (!f || !f.open("r")) { return out; }
        while (!f.eof) {
            var line = trim(f.readln());
            if (line === "" || line.charAt(0) === "#") { continue; }
            var p = line.split("|");
            if (p.length >= 2) { out.push({ t: parseFloat(p[0]), label: trim(p[1]), note: p.length > 2 ? trim(p[2]) : "" }); }
        }
        f.close();
        out.sort(function (a, b) { return a.t - b.t; });
        return out;
    }

    function listMedia(folder) {
        var ok = /\.(png|jpe?g|psd|tif?f|mp4|mov|webm)$/i;
        var files = folder.getFiles(function (f) { return (f instanceof File) && ok.test(f.name); });
        files.sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0); });
        return files;
    }

    // --- Input ---
    var markerFile = File.openDialog("Pilih file *_markers.txt dari beat_sync.py", "*.txt");
    if (!markerFile) { return; }
    var marks = readMarkers(markerFile);
    if (marks.length === 0) { alert("Marker kosong / format salah."); return; }

    var bps = parseInt(prompt("Ganti shot tiap berapa ketukan? (phonk 1-2, achievement 4, sedih 8)", String(CFG.beatsPerShot)), 10);
    if (!(bps > 0)) { bps = CFG.beatsPerShot; }
    var audioFile = File.openDialog("Pilih file sound (Cancel = tanpa audio)");
    var folder = Folder.selectDialog("Pilih folder panel/klip (Cancel = hanya rig)");

    app.beginUndoGroup("MMV Black Clover 1x1");
    var proj = app.project || app.newProject();

    // durasi = marker terakhir + 1 ketukan, atau durasi audio
    var beats = [], hits = [], lastT = 0, i;
    for (i = 0; i < marks.length; i++) {
        if (marks[i].label === "BEAT") { beats.push(marks[i].t); }
        if (marks[i].label === "IMPACT" || marks[i].label === "DROP") { hits.push(marks[i]); }
        if (marks[i].t > lastT) { lastT = marks[i].t; }
    }
    var audioItem = null, duration = lastT + 1.0;
    if (audioFile) {
        audioItem = proj.importFile(new ImportOptions(audioFile));
        duration = audioItem.duration;
    }

    var S = CFG.size;
    var comp = proj.items.addComp(CFG.compName, S, S, 1.0, duration, CFG.fps);
    comp.bgColor = [0, 0, 0];
    for (i = 0; i < marks.length; i++) {
        if (marks[i].label === "BEAT") { continue; } // beat banyak sekali; cukup impact/drop/quiet
        var mv = new MarkerValue(marks[i].label + (marks[i].note ? " " + marks[i].note : ""));
        comp.markerProperty.setValueAtTime(marks[i].t, mv);
    }
    if (audioItem) { comp.layers.add(audioItem); }

    // --- Cut list: tiap N beat + DROP ---
    var cuts = [0];
    for (i = bps; i < beats.length; i += bps) { cuts.push(beats[i]); }
    for (i = 0; i < hits.length; i++) { if (hits[i].label === "DROP") { cuts.push(hits[i].t); } }
    cuts.sort(function (a, b) { return a - b; });
    var clean = [];
    for (i = 0; i < cuts.length; i++) {
        if (clean.length === 0 || cuts[i] - clean[clean.length - 1] > 0.2) { clean.push(cuts[i]); }
    }
    cuts = clean;

    // --- Panel / klip ---
    if (folder) {
        var media = listMedia(folder);
        if (media.length === 0) { alert("Folder tidak berisi gambar/video."); }
        for (i = 0; i < cuts.length && media.length > 0; i++) {
            var t0 = cuts[i];
            var t1 = (i + 1 < cuts.length) ? cuts[i + 1] : duration;
            var item = proj.importFile(new ImportOptions(media[i % media.length]));
            var L = comp.layers.add(item);
            L.moveToEnd();
            L.startTime = t0;
            L.inPoint = t0;
            L.outPoint = t1;
            L.threeDLayer = true;
            var cover = Math.max(S / item.width, S / item.height) * 100 * CFG.overscan;
            var sc = L.property("Transform").property("Scale");
            sc.setValueAtTime(t0, [cover, cover, 100]);
            sc.setValueAtTime(t1, [cover * (1 + CFG.pushIn / 100), cover * (1 + CFG.pushIn / 100), 100]);
            var e = new KeyframeEase(0, 33);
            sc.setTemporalEaseAtKey(1, [e, e, e], [e, e, e]);
            sc.setTemporalEaseAtKey(2, [e, e, e], [e, e, e]);
            L.name = "SHOT_" + (i + 1) + "_" + media[i % media.length].name;
        }
    }

    // --- Kamera 2.5D: CAM_CTRL + handheld sway ---
    var camNull = comp.layers.addNull(duration);
    camNull.name = "CAM_CTRL";
    camNull.threeDLayer = true;
    camNull.property("Transform").property("Position").setValue([S / 2, S / 2, 0]);
    camNull.property("Transform").property("Position").expression =
        "w = wiggle(0.6, 7); [w[0], w[1], value[2]];";
    var cam = comp.layers.addCamera("MMV_Camera_35mm", [S / 2, S / 2]);
    cam.parent = camNull;

    // Ekspresi bersama: membaca marker IMPACT/DROP di comp
    var HIT_FN =
        "function hitAmp(decay, win){ var m = thisComp.marker, a = 0;" +
        " for (var k = 1; k <= m.numKeys; k++){ var c = m.key(k).comment;" +
        "  if (c.indexOf('IMPACT') == 0 || c.indexOf('DROP') == 0){ var d = time - m.key(k).time;" +
        "   var boost = (c.indexOf('DROP') == 0) ? 1.6 : 1.0;" +
        "   if (d >= 0 && d < win){ a = Math.max(a, boost * Math.exp(-d * decay)); } } }" +
        " return a; }\n";

    // --- SHAKE + ZOOM PUNCH (adjustment layer dengan efek Transform) ---
    var shake = comp.layers.addSolid([1, 1, 1], "FX_SHAKE_PUNCH", S, S, 1.0, duration);
    shake.adjustmentLayer = true;
    var tr = shake.Effects.addProperty("ADBE Geometry2");
    try {
        tr.property("ADBE Geometry2-0002").expression = HIT_FN +
            "var a = hitAmp(11, 0.4) * " + CFG.shakePx + "; seedRandom(Math.floor(time * 30), true);" +
            " value + [random(-a, a), random(-a, a)];";
    } catch (e1) {}
    try {
        tr.property("ADBE Geometry2-0003").expression = HIT_FN + "value * (1 + hitAmp(9, 0.35) * 0.06);";
    } catch (e2) {}
    try { tr.property("ADBE Geometry2-0011").setValue(1); } catch (e3) {}

    // --- FLASH putih ---
    if (CFG.flashMax > 0) {
        var flash = comp.layers.addSolid([1, 1, 1], "FX_FLASH", S, S, 1.0, duration);
        flash.blendingMode = BlendingMode.ADD;
        flash.property("Transform").property("Opacity").expression =
            HIT_FN + "hitAmp(24, 0.18) * " + CFG.flashMax + ";";
    }

    // --- Partikel debu/bara ---
    var part = comp.layers.addSolid([0, 0, 0], "FX_PARTICLES_FG", S, S, 1.0, duration);
    part.blendingMode = BlendingMode.SCREEN;
    var pw = part.Effects.addProperty("CC Particle World");
    if (pw) {
        try {
            pw.property("Birth Rate").setValue(0.5);
            pw.property("Longevity (sec)").setValue(3.0);
            pw.property("Physics").property("Gravity").setValue(-0.06);
            pw.property("Physics").property("Velocity").setValue(0.3);
            pw.property("Particle").property("Birth Color").setValue(CFG.accent);
            pw.property("Particle").property("Death Color").setValue([1, 1, 1]);
        } catch (e4) {}
    }

    // --- Grade MMV: glow, ketajaman tinta, vignette ---
    var adj = comp.layers.addSolid([1, 1, 1], "ADJ_MMV_GRADE", S, S, 1.0, duration);
    adj.adjustmentLayer = true;
    var glow = adj.Effects.addProperty("ADBE Glo2");
    if (glow) {
        try {
            glow.property("Glow Threshold").setValue(70);
            glow.property("Glow Radius").setValue(36);
            glow.property("Glow Intensity").setValue(0.45);
            glow.property("Glow Intensity").expression = HIT_FN + "value + hitAmp(8, 0.5) * 0.9;";
        } catch (e5) {}
    }
    var sharp = adj.Effects.addProperty("ADBE Unsharp Mask2");
    if (sharp) {
        try { sharp.property("Amount").setValue(45); sharp.property("Radius").setValue(1.4); } catch (e6) {}
    }
    var vig = comp.layers.addSolid([0, 0, 0], "ADJ_VIGNETTE", S, S, 1.0, duration);
    var mask = vig.Masks.addProperty("ADBE Mask Atom");
    var shp = new Shape();
    var r = S * 0.62, c = S / 2, k = r * 0.5523;
    shp.vertices = [[c, c - r], [c + r, c], [c, c + r], [c - r, c]];
    shp.inTangents = [[-k, 0], [0, -k], [k, 0], [0, k]];
    shp.outTangents = [[k, 0], [0, k], [-k, 0], [0, -k]];
    shp.closed = true;
    mask.property("ADBE Mask Shape").setValue(shp);
    mask.property("ADBE Mask Feather").setValue([S * 0.35, S * 0.35]);
    mask.inverted = true;
    vig.property("Transform").property("Opacity").setValue(55);

    // --- Teks (gaya referensi: label kecil + nama glow) ---
    function addText(txt, size, y, color, glowOn) {
        var tl = comp.layers.addText(txt);
        var td = tl.property("Source Text").value;
        td.resetCharStyle();
        td.fontSize = size;
        td.fillColor = color;
        td.applyStroke = true;
        td.strokeColor = [0, 0, 0];
        td.strokeWidth = Math.max(2, size * 0.06);
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        tl.property("Source Text").setValue(td);
        tl.property("Transform").property("Position").setValue([S / 2, y]);
        if (glowOn) {
            var g = tl.Effects.addProperty("ADBE Glo2");
            try { g.property("Glow Radius").setValue(18); g.property("Glow Intensity").setValue(1.2); } catch (e7) {}
        }
        return tl;
    }
    var t1L = addText(CFG.titleText, 26, S * 0.76, [1, 0.85, 0.3], false);
    var t2L = addText(CFG.labelText, 64, S * 0.82, CFG.accent, true);
    t2L.property("Transform").property("Scale").expression =
        HIT_FN + "var s = 100 + hitAmp(10, 0.3) * 18; [s, s];";
    var wm = addText(CFG.watermark, 30, S * 0.93, [1, 1, 1], false);
    wm.property("Transform").property("Opacity").setValue(70);
    t1L.name = "TXT_TITLE"; t2L.name = "TXT_LABEL"; wm.name = "TXT_WATERMARK";

    comp.openInViewer();
    app.endUndoGroup();
    alert("Selesai: " + cuts.length + " shot, " + hits.length + " impact/drop, durasi " +
          duration.toFixed(2) + " dtk.\nCek frame di setiap marker DROP & IMPACT sebelum render.");
})();
