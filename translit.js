// --- TRANSLITERATOR ENGINE ---
// Ported from: https://www.sharrukin.io/assyrian-transliterator/

function aiiTranslit(aiiText) {
  const HBASA = '\u{073C}';
  const RWAHA = '\u{073F}';
  const ZLAMA_ANGULAR = '\u{0739}';
  const ZLAMA_HORIZONTAL = '\u{0738}';
  const PTHAHA = '\u{0732}';
  const ZQAPHA = '\u{0735}';

  const diacriticVowels = `${HBASA}${RWAHA}${ZLAMA_ANGULAR}${ZLAMA_HORIZONTAL}${PTHAHA}${ZQAPHA}`;
  const diacriticVowelsCapture = `([${diacriticVowels}])`;

  const TALQANA_ABOVE = '\u{0747}';
  const COMBINING_DIAERESIS = '\u{0308}';

  const ALAPH = 'ܐ';
  const SUPERSCRIPT_ALAPH = '\u{0711}';
  const WAW = 'ܘ';
  const YUDH = 'ܝ';

  const COMBINING_TILDE_BELOW = '\u{0330}';
  const COMBINING_TILDE_ABOVE = '\u{0303}';
  const COMBINING_MACRON_BELOW = '\u{0331}';
  const COMBINING_MACRON = '\u{0304}';
  const QUSHSHAYA = '\u{0741}';
  const RUKKAKHA = '\u{0742}';
  const COMBINING_BREVE_BELOW = '\u{032E}';
  const NON_VOWEL_DIACRITICS = `${COMBINING_TILDE_BELOW}${COMBINING_TILDE_ABOVE}${QUSHSHAYA}${RUKKAKHA}${COMBINING_BREVE_BELOW}${TALQANA_ABOVE}`;

  const COMBINING_DOT_BELOW = '\u{0323}';
  const COMBINING_DOT_ABOVE = '\u{0307}';

  const GLOTTAL_STOP = 'ʾ';
  const PHARYNGEAL = 'ʿ';

  const TR_THIRD_PERSON_FEM_SUFFIX = 'oh';
  const TR_WAW_PLUS_RVASA = 'u';

  const tt = {
    ܦ: 'p',
    ܒ: 'b',
    ܬ: 't',
    ܛ: 'ṭ',
    ܕ: 'd',
    ܟ: 'k',
    ܓ: 'g',
    ܩ: 'q',
    ܣ: 's',
    ܨ: 'ṣ',
    ܙ: 'z',
    ܫ: 'š',
    ܚ: 'ḥ',
    ܥ: PHARYNGEAL,
    ܗ: 'h',
    ܡ: 'm',
    ܢ: 'n',
    ܪ: 'r',
    ܠ: 'l',
  };
  const consonants = Object.keys(tt).join('');
  const consonantsCapture = `([${consonants}])`;
  const ttValues = Object.values(tt).join('');

  const mhagjana = [...'ܗܠܡܢܥܪ'].map((char) => tt[char]).join('') + ALAPH + YUDH + WAW;
  const mhagjanaCapture = `([${mhagjana}])`;

  const marhetana = [...'ܦܒܬܛܕܟܓܩܣܨܙܫܚ'].map((char) => tt[char]).join('');
  const marhetanaCapture = `([${marhetana}])`;

  const bdul = 'ܒܕܘܠ';
  const bdulCapture = `([${bdul}])`;
  const bdulCapture2 = `([${bdul}])([${bdul}])`;

  const ttTransposePunc = {
    '“': '”',
    '”': '“',
    '‘': '’',
    '’': '‘',
    '؟': '?', // question mark
    '«': '“', // quotation mark
    '»': '”', // quotation mark
    '،': ',', // comma
    '؛': ';', // semicolon
  };
  const ttTransposePuncKeys = Object.keys(ttTransposePunc).join('');
  const ttTransposePuncKeysCapture = `([${ttTransposePuncKeys}])`;

  const ttNext = {
    [WAW]: 'w',
    [YUDH]: 'y',

    [ZLAMA_ANGULAR]: 'ē',
    [ZLAMA_HORIZONTAL]: 'i',
    [PTHAHA]: 'a',
    [ZQAPHA]: 'ā',
  };
  const ttNextKeysCapture = `([${Object.keys(ttNext).join('')}])`;

  const phoneticReplacements = {
    ṭ: 't',
    ṣ: 's',
    š: 'sh',
    ḥ: 'kh',
    ž: 'zh',
    ḇ: 'v',
    ṯ: 'th',
    ḏ: 'd',
    ḵ: 'kh',
    ḡ: 'gh',
    ē: 'e', // 'eh' sound
    ī: 'ee',
    ā: 'a',
    [PHARYNGEAL]: '`',
    [GLOTTAL_STOP]: "'",
    č: 'ch',
  };
  const phoneticReplacementsKeysCapture = `([${Object.keys(phoneticReplacements).join('')}])`;

  const glides = `${ALAPH}${YUDH}${WAW}`;
  const consonantsMinusGlides = `${ttValues}čjžfḇṯḏḵḡ`;

  const lettersCapture = `([${glides}${consonantsMinusGlides}])`;
  const lettersNonCapture = `(?:[${glides}${consonantsMinusGlides}])`;
  const consonantsWawYudhCapture = `([${WAW}${YUDH}${consonantsMinusGlides}])`;
  const vowelsW = `${TR_WAW_PLUS_RVASA}o`;
  const vowelsY = 'eiēī';
  const vowels = `${vowelsW}${vowelsY}aā`;
  const consonantsAndVowelsCapture = `([${glides}${consonantsMinusGlides}${vowels}])`;

  const fixes = [
    [`${diacriticVowelsCapture}${QUSHSHAYA}`, `${QUSHSHAYA}$1`],
    [`([${ttTransposePuncKeys}()!.:"'])`, '#$1#'],
  ];

  const specialCases = [
    ['ܝܼܗܘܼܕ', 'īhud'],
    ['ܝܼܚܝܼܕܵܝܵܐ', 'īḥīdāyā'],
    ['ܝܼܣܲܪ', 'īsar'],
    ['ܝܼܠܝܼܕܘܼܬܵܐ', 'īlidutā'],
    ['ܝܼܕܵܥ', 'īdāʿ'],
    [`#ܒܗ${COMBINING_DOT_ABOVE}ܝ#`, '#b-ay#'],
    [`ܗ${COMBINING_DOT_ABOVE}ܝ#`, 'aya#'],
    [`ܗ${COMBINING_DOT_ABOVE}ܘ#`, 'awa#'],
    [`ܡ${COMBINING_DOT_ABOVE}ܢ#`, 'man#'],
    [`ܡ${COMBINING_DOT_BELOW}ܢ#`, 'min#'],
    ['ܒܵܬܹܐ#', 'bāttē#'],
    ['ܟ̰ܵܐܝ', 'čāy'],
    ['ܒܵܐܝ', 'bāy'],
    ['ܐܲܦ̮ܘܿܟܵܕ', 'avokād'],
    ['ܝܼܫܘܿܥ#', 'īšoʿ#'], 
    ['ܢܲܦ̮ܫ', 'noš'],
    ['ܘܼܦ̮', 'ܘܼ'], 
    ['ܕܝܼܢܵܐ#', 'dīnā#'], 
    ['#ܝܘܸܢ#', '#ìwen#'], ['#ܝܘܵܢ#', '#ìwān#'],
    ['#ܝܘܲܚ#', '#ìwaḥ#'], ['#ܝܘܸܬ#', '#ìwet#'],
    ['#ܝܘܵܬܝ#', '#ìwāt#'], ['#ܝܬܘܿܢ#', '#ìton#'],
    ['#ܝܠܹܗ#', '#ìlēh#'], ['#ܝܠܵܗ̇#', '#ìlāh#'],
    ['#ܝܢܵܐ#', '#ìnā#'], ['#ܝܗ݇ܘܵܐ#', '#ìwā#'],
    ['#ܝܗ݇ܘܵܬ݇#', '#ìwā#'], ['#ܝܗ݇ܘܵܘ#', '#ìwā#'],
    ['ܝܼܘܸܢ#', 'īwen#'], ['ܝܼܘܵܢ', 'īwān'],
    ['ܝܼܘܸܬ#', 'īwet#'], ['ܝܼܘܵܬܝ#', 'īwāt#'],
    ['ܝܼܠܹܗ#', 'īlēh#'], ['ܝܼܠܵܗ̇#', 'īlāh#'],
    ['ܝܼܘܲܚ#', 'īwaḥ#'], ['ܝܼܬܘܿܢ#', 'īton#'], ['ܝܼܢܵܐ#', 'īnā#'],
    ['ܝܼܗ݇ܘܵܐ#', 'īwā#'], ['ܝܼܗ݇ܘܵܘ#', 'īwā#'],
    ['#ܗ݇ܘܝܼ', '#wī'], ['#ܗ݇ܘܹܝܡܘܼܢ#', '#wēmun#'],
    ['#ܗ݇ܘܵܐ#', '#wā#'],
    ['#ܗ݇ܘܵܘ#', '#wā#'],
    ['#ܗ݇ܘܹܐ#', '#wē#'],
    ['ܟܠ#', 'kul#'], ['ܟܠܵܢ#', 'kullān#'],
    ['ܟܠܘܼܟ݂#', 'kulloḵ#'], ['ܟܠܵܟ݂ܝ#', 'kullāḵ#'],
    ['ܟܠܹܗ#', 'kullēh#'], ['ܟܠܵܗ̇#', 'kullāh#'],
    ['ܟܠܘܼܗܝ#', 'kulluh#'], ['ܟܠܘܿܗ̇#', 'kulloh#'],
    ['ܟܠܲܢ#', 'kullan#'], ['ܟܠܵܘܟ݂ܘܿܢ#', 'kullāwḵon#'], ['ܟܠܲܘܟ݂ܘܿܢ#', 'kullāwḵon#'],
    ['ܟܠܵܝܗܝ#', 'kullāyh#'], ['ܟܠܗܘܿܢ#', 'kullhon#'],
    ['ܟܠܵܢܵܐܝܼܬ#', 'kullānāʾīt#'], ['ܟܠܵܢܵܐܝܼܬ݂#', 'kullānāʾīṯ#'],
    ['ܟܠܵܢܵܝ', 'kullānāy'], ['ܟܘܿܠܵܝ', 'kollāy'],
    ['ܟܠܚܲܕ݇#', 'kulḥa#'], ['ܟܠܚܕ݂ܵܐ#', 'kulḥḏā#'],
    ['ܟܠܫܲܢ݇ܬ#', 'kulšat#'],
    ['ܝܲܐܠܵܗ#', 'yallāh#'], ['ܘܲܐܠܵܗ#', 'wallāh#'],
    ['ܙܹܠ݇ܝ#', 'zē#'], ['ܬܵܐܝ#', 'tā#'],
  ];

  let text = aiiText;
  text = text.normalize('NFC');
  text = text.replaceAll(' | ', '# | #');
  text = `##${text.replaceAll(' ', '# #')}##`;
  text = text.replaceAll('ـ', '');
  text = text.replaceAll(COMBINING_DIAERESIS, '');
  text = text.replaceAll(SUPERSCRIPT_ALAPH, '');

  let re;
  fixes.forEach((fix) => {
    re = new RegExp(fix[0], 'g');
    text = text.replaceAll(re, fix[1]);
  });

  specialCases.forEach((specialCase) => {
    text = text.replaceAll(specialCase[0], specialCase[1]);
  });

  const eConj = ['ܥ', 'ܥܝ', `ܥܡܘ${HBASA}ܢ`];
  re = new RegExp(`([${consonants}${YUDH}][${NON_VOWEL_DIACRITICS}]?[${consonants}][${NON_VOWEL_DIACRITICS}]?)${ZLAMA_ANGULAR}(${eConj.join('|')})#`, 'g');
  text = text.replaceAll(re, `$1${YUDH}${HBASA}$2#`);

  const rConj = [
    `${ZQAPHA}ܟ${RUKKAKHA}${YUDH}`, 
    `${ZLAMA_ANGULAR}ܗ`, 
    `${ZQAPHA}ܗ${COMBINING_DOT_ABOVE}`, 
    `${PTHAHA}ܢ`, 
    `${ZQAPHA}${WAW}ܟ${RUKKAKHA}${WAW}${RWAHA}ܢ`, 
  ];

  re = new RegExp(`${YUDH}${HBASA}ܪ(${rConj.join('|')})#`, 'g');
  text = text.replaceAll(re, `${ZLAMA_HORIZONTAL}ܪ$1#`);

  text = text.replaceAll(`ܟ${COMBINING_TILDE_BELOW}`, 'č');
  text = text.replaceAll(`ܓ${COMBINING_TILDE_BELOW}`, 'j');
  text = text.replaceAll(`ܫ${COMBINING_TILDE_BELOW}`, 'ž');

  text = text.replaceAll(`ܙ${COMBINING_TILDE_ABOVE}`, 'ž');
  text = text.replaceAll(`ܟ${COMBINING_TILDE_ABOVE}`, 'č');
  text = text.replaceAll(`ܫ${COMBINING_TILDE_ABOVE}`, 'ž');

  text = text.replaceAll(`ܦ${COMBINING_BREVE_BELOW}`, 'f');

  text = text.replaceAll(`ܦ${QUSHSHAYA}`, 'p');
  text = text.replaceAll(`ܒ${QUSHSHAYA}`, 'b');
  text = text.replaceAll(`ܬ${QUSHSHAYA}`, 't');
  text = text.replaceAll(`ܕ${QUSHSHAYA}`, 'd');
  text = text.replaceAll(`ܟ${QUSHSHAYA}`, 'k');
  text = text.replaceAll(`ܓ${QUSHSHAYA}`, 'g');

  text = text.replaceAll(`ܒ${RUKKAKHA}`, 'ḇ');
  text = text.replaceAll(`ܬ${RUKKAKHA}`, 'ṯ');
  text = text.replaceAll(`ܕ${RUKKAKHA}`, 'ḏ');
  text = text.replaceAll(`ܟ${RUKKAKHA}`, 'ḵ');
  text = text.replaceAll(`ܓ${RUKKAKHA}`, 'ḡ');

  const initialTranslitChar = 'aī'; 
  const initialCharCapture = `([${ALAPH}${initialTranslitChar}])`; 
  re = new RegExp(`#${bdulCapture2}${initialCharCapture}`, 'g');
  text = text.replaceAll(re, '#$1-$2-$3');
  re = new RegExp(`#${bdulCapture}${initialCharCapture}`, 'g');
  text = text.replaceAll(re, '#$1-$2');

  text = text.replaceAll(`${WAW}${HBASA}ܗ${COMBINING_DOT_ABOVE}#`, `${TR_THIRD_PERSON_FEM_SUFFIX}#`);

  text = text.replaceAll(`${YUDH}${HBASA}ܥ`, 'īܥ');
  text = text.replaceAll(`${YUDH}${HBASA}`, '⚹'); 
  text = text.replaceAll(`${WAW}${RWAHA}`, 'o');
  text = text.replaceAll(`${WAW}${HBASA}`, TR_WAW_PLUS_RVASA);

  re = new RegExp(ttTransposePuncKeysCapture, 'g');
  text = text.replaceAll(re, (match) => ttTransposePunc[match]);

  re = new RegExp(consonantsCapture, 'g');
  text = text.replaceAll(re, (match) => tt[match]);

  text = text.replaceAll(`#${ALAPH}#`, `#${GLOTTAL_STOP}#`);

  re = new RegExp(`${lettersCapture}${mhagjanaCapture}${COMBINING_MACRON_BELOW}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '$1e$2$3');

  re = new RegExp(`${lettersCapture}${marhetanaCapture}${COMBINING_MACRON}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '$1$2e$3');

  re = new RegExp(`${lettersNonCapture}${TALQANA_ABOVE}`, 'g');
  text = text.replaceAll(re, '');

  re = new RegExp(`([${ZLAMA_HORIZONTAL}${PTHAHA}])${lettersCapture}${diacriticVowelsCapture}`, 'g');
  text = text.replaceAll(re, '$1$2$2$3');
  re = new RegExp(`([${ZLAMA_HORIZONTAL}${PTHAHA}])${lettersCapture}${TR_WAW_PLUS_RVASA}${lettersCapture}${diacriticVowelsCapture}`, 'g');
  text = text.replaceAll(re, `$1$2$2${TR_WAW_PLUS_RVASA}$3$4`);
  re = new RegExp(`([${ZLAMA_HORIZONTAL}${PTHAHA}])${lettersCapture}${TR_THIRD_PERSON_FEM_SUFFIX}`, 'g');
  text = text.replaceAll(re, `$1$2$2${TR_THIRD_PERSON_FEM_SUFFIX}`);

  text = text.replaceAll(COMBINING_DOT_ABOVE, '');

  re = new RegExp(`${consonantsWawYudhCapture}⚹${lettersCapture}([^${diacriticVowels}])`, 'g');
  text = text.replaceAll(re, '$1i$2$3');
  text = text.replaceAll('⚹', 'ī');

  re = new RegExp(`${lettersCapture}${ZLAMA_ANGULAR}${YUDH}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '$1ē$2');

  re = new RegExp(`#${bdulCapture}${YUDH}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '#$1-$2');

  re = new RegExp(`${lettersCapture}${YUDH}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '$1i$2');

  re = new RegExp(`([${consonantsMinusGlides}])${YUDH}#`, 'g');
  text = text.replaceAll(re, '$1#');

  text = text.replaceAll(`${ALAPH}${PTHAHA}${WAW}#`, 'aw#');
  text = text.replaceAll(`${ALAPH}${PTHAHA}${YUDH}#`, 'ay#');

  text = text.replaceAll(`#${ALAPH}${ZLAMA_ANGULAR}${YUDH}`, '#ē');
  text = text.replaceAll(`#${ALAPH}${YUDH}`, '#ī');

  re = new RegExp(`#${YUDH}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '#$1');

  text = text.replaceAll(`${PTHAHA}${ALAPH}#`, 'a#');
  text = text.replaceAll(`${ZLAMA_ANGULAR}${ALAPH}#`, 'ē#');

  re = new RegExp(`${ZLAMA_HORIZONTAL}${ALAPH}(?:${YUDH})?#`, 'g');
  text = text.replaceAll(re, `i${GLOTTAL_STOP}#`);

  text = text.replaceAll(`${ZQAPHA}${ALAPH}#`, 'ā#');
  text = text.replaceAll(`${ALAPH}#`, 'ā#');
  text = text.replaceAll(`#${ALAPH}`, '#');
  text = text.replaceAll(ALAPH, GLOTTAL_STOP);

  re = new RegExp(`#${WAW}${consonantsAndVowelsCapture}`, 'g');
  text = text.replaceAll(re, '#w-$1');

  re = new RegExp(ttNextKeysCapture, 'g');
  text = text.replaceAll(re, (match) => ttNext[match]);

  re = new RegExp(`([ēīā])${GLOTTAL_STOP}${lettersCapture}`, 'g');
  text = text.replaceAll(re, '$1$2');

  re = new RegExp(`([${vowelsW}])([${vowels}])`, 'g');
  text = text.replaceAll(re, '$1w$2');
  re = new RegExp(`([${vowelsY}])([${vowels}])`, 'g');
  text = text.replaceAll(re, '$1y$2');

  re = new RegExp(`([aā])ḇ([${consonantsMinusGlides.replace('ḇ', '')}])`, 'g');
  text = text.replaceAll(re, '$1w$2');

  re = new RegExp(`uḇ([${consonantsMinusGlides}])`, 'g');
  text = text.replaceAll(re, 'u$1');

  re = new RegExp(`([${PHARYNGEAL}${GLOTTAL_STOP}āšyḥhčžj])\\1+`, 'g');
  text = text.replace(re, '$1');
  text = text.replaceAll(/([ḥčḡš])h/g, '$1');

  text = text.replaceAll(`-${GLOTTAL_STOP}`, '-');

  let phoneticText = text; 
  text = text.replaceAll('#', '');

  re = new RegExp(`ē([${PHARYNGEAL}${GLOTTAL_STOP}])`, 'g');
  phoneticText = phoneticText.replaceAll(re, 'eh$1');

  re = new RegExp(`([${PHARYNGEAL}${GLOTTAL_STOP}])ā#`, 'g');
  phoneticText = phoneticText.replaceAll(re, '$1ah#');

  phoneticText = phoneticText.replaceAll(/ē#/g, 'eh#');
  phoneticText = phoneticText.replaceAll(/uh#/g, 'oo#');

  phoneticText = phoneticText.replaceAll('#', '');

  const sDelimiter = ' ❋ '; 
  const eDelimiter = ' ❊ '; 
  [[sDelimiter, `-${sDelimiter}`], [eDelimiter, `${eDelimiter}-`]].forEach((delimGroup) => {
    const [delim, hypenTerm] = delimGroup;
    const nonCG1 = `(?:[ ]+)${delim}(?:[ ]*)`;
    const nonCG2 = `(?:[ ]*)${delim}(?:[ ]+)`;
    const nonCG = `(?:${nonCG1}|${nonCG2})`;
    re = new RegExp(`([${consonantsMinusGlides}${vowels}wy])${nonCG}ì`, 'g');
    phoneticText = phoneticText.replaceAll(re, `$1${hypenTerm}`);
  });

  re = new RegExp(`([${consonantsMinusGlides}${vowels}wy])(?:[ ]+)ì`, 'g'); 
  phoneticText = phoneticText.replaceAll(re, '$1-');

  phoneticText = phoneticText.replaceAll('ì', '-');

  phoneticText = phoneticText
    .replaceAll('w-', 'oo-')
    .replaceAll('āyh', 'āy')
    .replaceAll('ayh', 'ay'); 

  re = new RegExp(phoneticReplacementsKeysCapture, 'g');
  phoneticText = phoneticText.replaceAll(re, (match) => phoneticReplacements[match]);

  return { latin: text, phonetic: phoneticText };
}