// بيانات المنهج — **المصدر الوحيد للحقيقة** (قاعدة `SESSIONS.md` العامة، و`METHOD.md`
// في رأسه: «البياناتُ مصدرُها الوحيد `app/js/curriculum.js` يومَ يُكتب»).
//
// ————— كتبتها **الجلسة ١** على عقدها المعلن (`SESSIONS.md`) —————
//
// وعقدُ الجلسة ٠ الذي كُتب في رأس هذه البذرة قائمٌ بنقاطه الستّ، وهذه مواضعُه:
//
// ١) **رصيدان لا رصيد**: `STARTERS` (كامبردج) و`GRADES` (Letters and Sounds).
// ٢) **مساران مقترنان**: كلُّ كلمةِ قراءةٍ في `GRADES[].words[]` تحمل `listen` —
//    **مفتاحَها السمعيّ مكتوباً**، لا يُشتقّ بمطابقة رسمٍ ولا يُخمَّن. ويقرؤه
//    `tools/check_coupling.mjs`.
// ٣) **كلُّ محطةٍ تُعلن جبهتَها**: `frontier: { fields, symbols, tricky }` —
//    وعليها يقوم `tools/check_range.py` الثلاثيّ.
// ٤) **الرحلةُ محسوبةٌ لا مكتوبة**: `sections()` تؤلّف المراحلَ والعهود والبوابات من
//    الجداول أدناه، ولا رقمَ محطاتٍ مكتوبٌ بيد في هذا الملفّ ولا في حارس.
// ٥) **القفلُ تسلسليّ**: ترتيبُ `sections()` هو ترتيبُ الرحلة.
// ٦) **البوابات الثلاث** في مواضعها من `sections()`.
//
// ————— من أين جاءت كلُّ كلمةٍ ورمز (نقلاً لا تقديراً) —————
//
// **الرصيد السمعيّ**: استُخرج من ملفّ كامبردج الرسميّ نفسِه (PDF، ٤٤ صفحة) لا من
// ذاكرة: صفحاتُ ٤–٧ «Pre A1 Starters A–Z wordlist» ⇒ **٤٩٥ مدخلاً** — وهو عينُ عدد
// الدراسة في `METHOD.md §٣`؛ وصفحاتُ ٣٨–٤٣ «thematic vocabulary list» ⇒ **حقولُ
// المفردات** التي تنبني عليها محطاتُ س١ وس٥ (`FIELDS` أدناه بأسمائها الإنكليزية كما
// وردت). ويقابل `tools/fetch_starters.py --check` ما ههنا بالملفّ الحيّ فيمسك أيَّ
// انحراف.
//
// **سلّمُ الحرف**: الرموزُ نصاً من `METHOD.md §٥` (وهي مجموعاتُ L&S الخمسُ ومراحلُها)،
// **والشائكاتُ التي لم يسمّها المنهج** (المرحلة ٥: خمسٌ وعشرون) نُقلت من وثيقة L&S
// نفسِها ص١٣٢–١٣٣ («Teach reading the words …») — وعُدَّت فطابقت ميزانيةَ `METHOD.md`
// حرفاً بحرف: ٥ ← ١٧ ← ٣١ ← ٥٦.
//
// **الصور**: Twemoji محلية (`app/emoji/`) — و**ما لا صورةَ صادقة له لم يُتكلَّف بل
// رُفِع**: `RAISED` أدناه يحمل كلَّ كلمةٍ من حقول المنهج بلا صورةٍ صادقة وسببَها،
// ويحرس `check_range` ألّا تدخل محطةً.

// ————————————————————————————————————————————————————————————————————————
// ١) الرصيدُ السمعيّ — قائمة Cambridge Pre A1 Starters ‏2025
// ————————————————————————————————————————————————————————————————————————

/** مصدرُ الرصيد بعينه — يقرؤه `tools/fetch_starters.py` فيقابل ما هنا بما هناك. */
export const STARTERS_SOURCE = {
  title: 'Pre A1 Starters, A1 Movers and A2 Flyers Wordlists (2025)',
  url: 'https://www.cambridgeenglish.org/Images/739104-starters-movers-flyers-word-list-2025.pdf',
  pages: { alphabetic: [4, 7], thematic: [38, 43] },
  entries: 495,
};

/**
 * **مداخلُ Starters الـ٤٩٥ كما كُتبت في الملفّ** — بأقواسها ومائلاتها لا تُنقَّح:
 * `'candy (UK sweet(s))'` · `'child/children'` · `'fish (s + pl)'`. فالتنقيحُ رأيٌ،
 * والنقلُ حقيقةٌ تُقابَل. وصِيَغُ الكلمة المسموح بها تُشتقّ منها بقاعدةٍ واحدة
 * معلَنة في `starterForms()` أدناه.
 */
export const STARTERS = [
  'a', 'a lot', 'a lot of', 'about', 'add', 'afternoon', 'again', 'Alex', 'Alice', 'alien',
  'alphabet', 'an', 'and', 'angry', 'animal', 'Ann/Anna', 'answer', 'apartment (UK flat)',
  'apple', 'arm', 'armchair', 'ask', 'at', 'baby', 'badminton', 'bag', 'ball', 'balloon',
  'banana', 'baseball', 'baseball cap', 'basketball', 'bat (as sports equipment)', 'bath',
  'bathroom', 'be', 'beach', 'bean', 'bear', 'beautiful', 'bed', 'bedroom', 'bee', 'behind',
  'Ben', 'between', 'big', 'bike', 'Bill', 'bird', 'birthday', 'black', 'blue', 'board',
  'board game', 'boat', 'body', 'book', 'bookcase', 'bookshop', 'boots', 'bounce', 'box',
  'boy', 'bread', 'breakfast', 'brother', 'brown', 'burger', 'bus', 'but', 'bye', 'cake',
  'camera', 'can', 'candy (UK sweet(s))', 'car', 'carrot', 'cat', 'catch (e.g. a ball)',
  'chair', 'chicken', 'child/children', 'chips (US fries)', 'chocolate', 'choose', 'clap',
  'class', 'classmate', 'classroom', 'clean', 'clock', 'close', 'closed', 'clothes',
  'coconut', 'colour (US color)', 'come', 'complete', 'computer', 'cool', 'correct', 'count',
  'cousin', 'cow', 'crayon', 'crocodile', 'cross', 'cupboard', 'dad', 'Dan', 'day', 'desk',
  'dining room', 'dinner', 'dirty', 'do', 'dog', 'doll', 'donkey', 'don’t worry', 'door',
  'double', 'draw', 'drawing', 'dress', 'drink', 'drive', 'duck', 'ear', 'eat', 'egg',
  'elephant', 'end', 'English', 'enjoy', 'eraser (UK rubber)', 'Eva', 'evening', 'example',
  'eye', 'face', 'family', 'fantastic', 'father', 'favourite (US favorite)', 'find',
  'fish (s + pl)', 'fishing', 'flat (US apartment)', 'floor', 'flower', 'fly', 'food',
  'foot/feet', 'football (US soccer)', 'for', 'friend', 'fries (UK chips)', 'frog', 'from',
  'fruit', 'fun', 'funny', 'game', 'garden', 'get', 'giraffe', 'girl', 'give', 'glasses',
  'go', 'go to bed', 'go to sleep', 'goat', 'good', 'goodbye', 'Grace', 'grandfather',
  'grandma', 'grandmother', 'grandpa', 'grape', 'gray (UK grey)', 'great', 'green',
  'grey (US gray)', 'guitar', 'hair', 'hall', 'hand', 'handbag', 'happy', 'hat', 'have',
  'have got', 'he', 'head', 'helicopter', 'hello', 'her', 'here', 'hers', 'hi', 'him',
  'hippo', 'his', 'hit', 'hobby', 'hockey', 'hold', 'home', 'hooray', 'horse', 'house',
  'how', 'how many', 'how old', 'Hugo', 'I', 'ice cream', 'in', 'in front of', 'it',
  'its', 'jacket', 'jeans', 'jellyfish', 'Jill', 'juice', 'jump', 'keyboard (computer)',
  'kick', 'kid', 'Kim', 'kitchen', 'kite', 'kiwi', 'know', 'lamp', 'learn', 'leg', 'lemon',
  'lemonade', 'lesson', 'letter (as in alphabet)', 'let’s', 'like', 'lime', 'line', 'listen',
  'live', 'living room', 'lizard', 'long', 'look', 'look at', 'lorry (US truck)', 'lots',
  'lots of', 'love', 'Lucy', 'lunch', 'make', 'man/men', 'mango', 'many', 'Mark', 'mat',
  'Matt', 'May (as in girl’s name)', 'me', 'me too', 'meat', 'meatballs', 'milk', 'mine',
  'mirror', 'Miss', 'monkey', 'monster', 'morning', 'mother', 'motorbike', 'mouse (computer)',
  'mouse/mice', 'mouth', 'Mr', 'Mrs', 'mum', 'music', 'my', 'name', 'new', 'next to',
  'nice', 'Nick', 'night', 'no', 'nose', 'not', 'now', 'number', 'of', 'oh', 'oh dear', 'OK',
  'old', 'on', 'one', 'onion', 'open', 'or', 'orange', 'our', 'ours', 'page', 'paint',
  'painting', 'paper', 'pardon', 'park', 'part', 'Pat', 'pea', 'pear', 'pen', 'pencil',
  'person/people', 'pet', 'phone', 'photo', 'piano', 'pick up', 'picture', 'pie', 'pineapple',
  'pink', 'plane', 'play', 'playground', 'please', 'point', 'polar bear', 'poster', 'potato',
  'purple', 'put', 'question', 'radio', 'read', 'really', 'red', 'rice', 'ride', 'right',
  'right (as in correct)', 'robot', 'room', 'rubber (US eraser)', 'rug', 'ruler', 'run',
  'sad', 'Sam', 'sand', 'sausage', 'say', 'scary', 'school', 'sea', 'see', 'see you',
  'sentence', 'she', 'sheep (s + pl)', 'shell', 'ship', 'shirt', 'shoe', 'shop (US store)',
  'short', 'shorts', 'show', 'silly', 'sing', 'sister', 'sit', 'skateboard', 'skateboarding',
  'skirt', 'sleep', 'small', 'smile', 'snake', 'so', 'soccer (UK football)', 'sock', 'sofa',
  'some', 'song', 'sorry', 'spell', 'spider', 'sport', 'stand', 'start', 'stop',
  'store (UK shop)', 'story', 'street', 'Sue', 'sun', 'sweet(s) (US candy)', 'swim',
  'T-shirt', 'table', 'table tennis', 'tablet', 'tail', 'take a photo/picture', 'talk',
  'teacher', 'teddy (bear)', 'television/TV', 'tell', 'tennis', 'tennis racket', 'thank you',
  'thanks', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they',
  'thing', 'this', 'those', 'throw', 'tick', 'tiger', 'to', 'today', 'Tom', 'tomato', 'too',
  'toy', 'train', 'tree', 'trousers', 'truck (UK lorry)', 'try', 'TV/television', 'ugly',
  'under', 'understand', 'us', 'very', 'walk', 'wall', 'want', 'watch', 'water', 'watermelon',
  'wave', 'we', 'wear', 'well', 'well done', 'what', 'where', 'which', 'white', 'who',
  'whose', 'window', 'with', 'woman/women', 'word', 'would like', 'wow', 'write', 'year',
  'yellow', 'yes', 'you', 'young', 'your', 'yours', 'zebra', 'zoo',
];

/**
 * **بندٌ في القائمة نفسِها لا في ذاكرتنا** (ص٧ نصاً): «Candidates will be expected to
 * understand and write the letters of the alphabet and **numbers 1–20**». فأسماءُ
 * الأعداد مطلوبةٌ في الرصيد وليست مداخلَ في جدول A–Z (وحدَها `one` مدخل) — فتُعلَن هنا
 * ببندها، ومنها تُبنى محطةُ س١-٦.
 */
export const STARTERS_LETTERS_NOTE =
  'Candidates will be expected to understand and write the letters of the alphabet '
  + 'and numbers 1–20.';

/** أسماءُ الأعداد ١–٢٠ — مادّةُ البند أعلاه (والمحطةُ تأخذ العشرةَ الأولى). */
export const NUMBER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty',
];

/**
 * **صِيَغٌ صرفية لمداخلَ في الرصيد** — قليلةٌ ومعلَنةٌ بمدخلها، لا اشتقاقَ صامت.
 * جملُ س٥-٦ تقول «The cat **is** on the bed»، و`is` صيغةُ `be` وهو مدخلٌ في القائمة.
 * فالقاعدةُ أن يُكتب الاستثناءُ ومرجعُه، لا أن يُصرَّف الرصيدُ بخوارزمية.
 */
export const FORMS = { is: 'be', am: 'be', are: 'be' };

/**
 * **صِيَغُ الكلمة المقبولة من مدخلٍ واحد** — قاعدةٌ واحدة تُقرأ ولا تُخمَّن:
 * يُسقَط ما بين قوسين (`bat (as sports equipment)` ⇒ `bat`)، ويُشقّ ما فيه مائل
 * (`child/children` ⇒ الاثنتان)، ويُقبل ما في القوس إن كان بديلاً لهجياً
 * (`colour (US color)` ⇒ `colour` و`color`).
 */
export function starterForms() {
  const forms = new Set();
  for (const entry of STARTERS) {
    const head = entry.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    for (const part of head.split('/')) if (part.trim()) forms.add(part.trim());
    for (const inside of entry.match(/\(([^)]*)\)/g) || []) {
      const body = inside.slice(1, -1).replace(/^(UK|US)\s+/, '').replace(/[()]/g, '');
      if (/^[a-z-]+$/i.test(body)) forms.add(body.trim());
    }
  }
  for (const word of NUMBER_WORDS) forms.add(word);
  for (const form of Object.keys(FORMS)) forms.add(form);
  return forms;
}

/** أهذه الكلمةُ من الرصيد السمعيّ المُعلَن؟ (يقرؤها الفاحصان). */
export function inBank(word) {
  return starterForms().has(String(word));
}

// ————————————————————————————————————————————————————————————————————————
// ٢) حقولُ الرصيد — من «thematic vocabulary list» بأسمائها هناك
// ————————————————————————————————————————————————————————————————————————

/**
 * حقولُ كامبردج التي تنبني عليها محطاتُ س١ وس٥ (`METHOD.md §٤`). و`en` اسمُ الحقل في
 * الملفّ حرفاً — فمن أراد أن يقابل كلمةً بحقلها وجد العمودَ بعينه.
 */
export const FIELDS = [
  { id: 'family', ar: 'الأهل', en: 'Family & friends' },
  { id: 'body', ar: 'الجسد والوجه', en: 'The body and the face' },
  { id: 'animals', ar: 'الحيوانات', en: 'Animals' },
  { id: 'food', ar: 'الطعام والشراب', en: 'Food & drink' },
  { id: 'colours', ar: 'الألوان', en: 'Colours' },
  { id: 'numbers', ar: 'الأعداد', en: 'Numbers' },
  { id: 'clothes', ar: 'الملابس', en: 'Clothes' },
  { id: 'school', ar: 'المدرسة واللعب', en: 'School · Toys · Sports & leisure' },
  { id: 'home', ar: 'البيت أغراضاً', en: 'The home' },
  { id: 'places', ar: 'الأماكن والطبيعة', en: 'Places & directions · The world around us' },
  { id: 'verbs', ar: 'أفعالُ اليوم', en: 'School · Sports & leisure (verbs)' },
  { id: 'sentences', ar: 'جملُ الآن وهنا', en: '—' },
];

// ————————————————————————————————————————————————————————————————————————
// ٣) الرصيدُ المصوَّر — كلمةٌ بحقلها ومحطتها وصورتها ومفتاحها
// ————————————————————————————————————————————————————————————————————————
//
// **الصورةُ صادقةٌ أو لا تكون**: `face` رمزُ Twemoji واحدٌ يرسم الكلمةَ نفسَها لا
// معناها القريب. وثلاثُ محطاتٍ لا صورةَ **مفردة** لكلماتها بطبيعتها، فتُعلن ذلك
// في `pictures` وتتولّى شاشتُها التصوير:
//   • `count` (س١-٦): صورةُ العدد **كميةٌ تُعَدّ** لا رقمٌ يُقرأ (قاعدةُ «اِحْسِبْ»:
//     الرمزُ تسميةٌ لكمٍّ حاضر) — فلكلِّ كلمةٍ `count` لا `face`.
//   • `scene` (س٢-٢ · س٢-٤ · س٥-٦): المعنى **ترتيبُ شيئين** (in/on/under · «السمكةُ
//     الحمراء» · «القطةُ على السرير») — تُصوَّر مشهداً لا رمزاً.
//   • `act` (س٢-٣): الفعلُ حركةٌ تفعلها الشخصية بلمسة الطفل — لا رمزَ ساكناً له.
//   • `swatch` (س١-٥): **بقعةُ لونٍ مُصيَّرة** — حكمُ المدير ١٣ أغسطس (`METHOD.md §٤`
//     أحكامُ المادة): «الألوانُ بلا مربع يونيكود (pink · grey) تُصوَّر بقعةَ لونٍ
//     مُصيَّرة (CSS) — صدقُ الصورة لا يشترط إيموجي، والبقعةُ أصدقُ من بديلٍ ملتبس».
//     فمحطةُ الألوان نمطُها `swatch`: كلمتُها **صورةٌ أو بقعةٌ بقيمة لونها**، ولا
//     بقعةَ لكلمةٍ من غير حقل الألوان (يحرسه `check_range` بابَه الأول).

/**
 * كلماتُ الرصيد المصوَّر: `w` الكلمة · `field` حقلُها · `at` محطتُها · `face` صورتُها
 * (أو `count` كمّيةً · `swatch` بقعةَ لون · `pictured` سببَ ألّا تكون صورةً مفردة).
 */
export const WORDS = [
  // س١-١ الأهل
  { w: 'mum', field: 'family', at: 's1-1', face: '👩‍👦' },
  { w: 'dad', field: 'family', at: 's1-1', face: '👨‍👧' },
  { w: 'baby', field: 'family', at: 's1-1', sounds: ['b', 'ai', 'b', 'ee'], face: '👶' },
  { w: 'boy', field: 'family', at: 's1-1', face: '👦' },
  { w: 'girl', field: 'family', at: 's1-1', face: '👧' },
  { w: 'grandma', field: 'family', at: 's1-1', soundless: 'مقطعُها الأخير شوا (/ˈɡrænmə/) — وليست في جدول الأربعين صوتاً', face: '👵' },
  { w: 'grandpa', field: 'family', at: 's1-1', soundless: 'كسابقتها', face: '👴' },
  { w: 'family', field: 'family', at: 's1-1', face: '👨‍👩‍👧‍👦' },
  { w: 'friend', field: 'family', at: 's1-1', sounds: ['f', 'r', 'e', 'n', 'd'], face: '🧑‍🤝‍🧑' },
  // س١-٢ الجسد والوجه
  { w: 'ear', field: 'body', at: 's1-2', face: '👂' },
  { w: 'eye', field: 'body', at: 's1-2', sounds: ['igh'], face: '👁️' },
  { w: 'nose', field: 'body', at: 's1-2', face: '👃' },
  { w: 'mouth', field: 'body', at: 's1-2', face: '👄' },
  { w: 'hand', field: 'body', at: 's1-2', face: '✋' },
  { w: 'foot', field: 'body', at: 's1-2', face: '🦶' },
  { w: 'leg', field: 'body', at: 's1-2', face: '🦵' },
  // س١-٣ الحيوانات
  { w: 'cat', field: 'animals', at: 's1-3', face: '🐈' },
  { w: 'dog', field: 'animals', at: 's1-3', face: '🐕' },
  { w: 'bird', field: 'animals', at: 's1-3', face: '🐦' },
  { w: 'fish', field: 'animals', at: 's1-3', face: '🐟' },
  { w: 'horse', field: 'animals', at: 's1-3', sounds: ['h', 'or', 's'], face: '🐎' },
  { w: 'cow', field: 'animals', at: 's1-3', face: '🐄' },
  { w: 'duck', field: 'animals', at: 's1-3', face: '🦆' },
  { w: 'sheep', field: 'animals', at: 's1-3', face: '🐑' },
  { w: 'goat', field: 'animals', at: 's1-3', face: '🐐' },
  { w: 'elephant', field: 'animals', at: 's1-3', soundless: 'شوا في مقطعها الأخير (/ˈɛləfənt/)', face: '🐘' },
  { w: 'monkey', field: 'animals', at: 's1-3', sounds: ['m', 'u', 'ng', 'k', 'ee'], face: '🐒' },
  { w: 'frog', field: 'animals', at: 's1-3', face: '🐸' },
  { w: 'bee', field: 'animals', at: 's1-3', face: '🐝' },
  { w: 'bear', field: 'animals', at: 's1-3', sounds: ['b', 'air'], face: '🐻' },
  { w: 'tiger', field: 'animals', at: 's1-3', sounds: ['t', 'igh', 'g', 'er'], face: '🐅' },
  { w: 'snake', field: 'animals', at: 's1-3', sounds: ['s', 'n', 'ai', 'k'], face: '🐍' },
  { w: 'spider', field: 'animals', at: 's1-3', face: '🕷️' },
  // س١-٤ الطعام والشراب
  { w: 'apple', field: 'food', at: 's1-4', sounds: ['a', 'p', 'l'], face: '🍎' },
  { w: 'banana', field: 'food', at: 's1-4', soundless: 'شوا في مقطعيها الأول والأخير (/bəˈnænə/)', face: '🍌' },
  { w: 'pear', field: 'food', at: 's1-4', sounds: ['p', 'air'], face: '🍐' },
  { w: 'grape', field: 'food', at: 's1-4', face: '🍇' },
  { w: 'bread', field: 'food', at: 's1-4', face: '🍞' },
  { w: 'milk', field: 'food', at: 's1-4', face: '🥛' },
  { w: 'water', field: 'food', at: 's1-4', sounds: ['w', 'or', 't', 'er'], face: '💧' },
  { w: 'egg', field: 'food', at: 's1-4', sounds: ['e', 'g'], face: '🥚' },
  { w: 'cake', field: 'food', at: 's1-4', sounds: ['k', 'ai', 'k'], face: '🍰' },
  { w: 'carrot', field: 'food', at: 's1-4', soundless: 'شوا في مقطعها الثاني (/ˈkærət/)', face: '🥕' },
  { w: 'rice', field: 'food', at: 's1-4', sounds: ['r', 'igh', 's'], face: '🍚' },
  { w: 'ice cream', field: 'food', at: 's1-4', soundless: 'كلمتان لا كلمة — والأصواتُ تُعلَن لكلمةٍ واحدة', face: '🍦' },
  // س١-٥ الألوان — والمربّعُ الملوّن أصدقُ صورةٍ للّون: لا شيءَ فيه سواه.
  // **وأربعةٌ تحمل قيمتَها معها**: هي ألوانُ الأمر المركّب في س٢-٤ (كرةٌ حمراء
  // كبيرة)، وقيمتُها **قيمةُ مربّعها في Twemoji نفسِها** — فاللونُ الذي رآه الطفلُ
  // مربّعاً هو اللونُ الذي يراه كرةً، ولا لونان لاسمٍ واحد.
  { w: 'red', field: 'colours', at: 's1-5', face: '🟥', swatch: '#DD2E44' },
  { w: 'blue', field: 'colours', at: 's1-5', face: '🟦', swatch: '#55ACEE' },
  { w: 'green', field: 'colours', at: 's1-5', face: '🟩', swatch: '#78B159' },
  { w: 'yellow', field: 'colours', at: 's1-5', face: '🟨', swatch: '#FDCB58' },
  { w: 'orange', field: 'colours', at: 's1-5', sounds: ['or', 'i', 'n', 'j'], face: '🟧' },
  { w: 'purple', field: 'colours', at: 's1-5', sounds: ['p', 'ur', 'p', 'l'], face: '🟪' },
  { w: 'brown', field: 'colours', at: 's1-5', face: '🟫' },
  { w: 'black', field: 'colours', at: 's1-5', face: '⬛' },
  { w: 'white', field: 'colours', at: 's1-5', face: '⬜' },
  // **وبقعتان مُصيَّرتان بصدق لونهما** (حكمُ المدير — `METHOD.md §٤`): لا مربّعَ
  // ورديّ ولا رماديّ في يونيكود، والقيمةُ هنا **قيمةُ اللون نفسِه** لا تقريبٌ له
  // (`pink` و`gray` من ألوان CSS المسمّاة حرفاً) — فما يراه الطفلُ هو ما يُسمّى.
  { w: 'pink', field: 'colours', at: 's1-5', sounds: ['p', 'i', 'ng', 'k'], swatch: '#FFC0CB' },
  { w: 'grey', field: 'colours', at: 's1-5', sounds: ['g', 'r', 'ai'], swatch: '#808080' },
  // س١-٦ الأعداد سمعاً — كميةٌ تُعَدّ لا رقمٌ يُقرأ
  { w: 'one', field: 'numbers', at: 's1-6', sounds: ['w', 'u', 'n'], count: 1 },
  { w: 'two', field: 'numbers', at: 's1-6', sounds: ['t', 'oo'], count: 2 },
  { w: 'three', field: 'numbers', at: 's1-6', sounds: ['th', 'r', 'ee'], count: 3 },
  { w: 'four', field: 'numbers', at: 's1-6', sounds: ['f', 'or'], count: 4 },
  { w: 'five', field: 'numbers', at: 's1-6', sounds: ['f', 'igh', 'v'], count: 5 },
  { w: 'six', field: 'numbers', at: 's1-6', sounds: ['s', 'i', 'ks'], count: 6 },
  { w: 'seven', field: 'numbers', at: 's1-6', soundless: 'شوا قبل النون (/ˈsɛvən/)', count: 7 },
  { w: 'eight', field: 'numbers', at: 's1-6', sounds: ['ai', 't'], count: 8 },
  { w: 'nine', field: 'numbers', at: 's1-6', sounds: ['n', 'igh', 'n'], count: 9 },
  { w: 'ten', field: 'numbers', at: 's1-6', sounds: ['t', 'e', 'n'], count: 10 },
  // س٢-٢ أوامرُ الوضع المكاني — حروفُ الجرّ مشهدٌ لا رمز
  { w: 'in', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'on', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'under', field: 'places', at: 's2-2', pictured: 'scene' },
  { w: 'behind', field: 'places', at: 's2-2', sounds: ['b', 'i', 'h', 'igh', 'n', 'd'], pictured: 'scene' },
  // س٢-٣ أفعالُ الحركة — حركةٌ تُفعَل لا صورةٌ تُرى
  { w: 'jump', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'clap', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'run', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'walk', field: 'verbs', at: 's2-3', sounds: ['w', 'or', 'k'], pictured: 'act' },
  { w: 'sit', field: 'verbs', at: 's2-3', pictured: 'act' },
  { w: 'stand', field: 'verbs', at: 's2-3', pictured: 'act' },
  // **وثلاثٌ نزلت من `RAISED` إلى الفعل** (حكمُ المدير ١٣ أغسطس — `METHOD.md §٤`):
  // «ما له فعلٌ جسديّ من المرفوعات (arm · face · smile…) يُنقل لشكل `tpr`
  // («المس ذراعك» — **الفعلُ جوابُه**) بدل الصورة الملتبسة». فما امتنع تصويرُه
  // رمزاً ساكناً (💪 عضلةٌ لا ذراع · وجوهُ الإيموجي كلُّها وجوه) يُؤدَّى **حركةً**:
  // الشخصيةُ تلمس ذراعَها أو وجهَها أو تبتسم، والطفلُ يلمس الفاعلةَ ثم يفعلها معها.
  // ونسبُها محفوظٌ في `RESOLVED` أدناه.
  // و`order` أمرُها المنطوق حيث يفارق قالبَ محطته (أدناه): الفعلُ يُؤمَر به مجرَّداً
  // («jump»)، وعضوُ الجسد يُؤمَر بلمسه («touch your arm») — والابتسامةُ فعلٌ فتُجرَّد.
  { w: 'arm', field: 'body', at: 's2-3', sounds: ['ar', 'm'], pictured: 'act', order: 'point to your arm' },
  { w: 'face', field: 'body', at: 's2-3', sounds: ['f', 'ai', 's'], pictured: 'act', order: 'point to your face' },
  { w: 'smile', field: 'body', at: 's2-3', sounds: ['s', 'm', 'igh', 'l'], pictured: 'act' },
  // س٢-٤ الأمرُ المركّب — الصفةُ تُميَّز في مشهدٍ من شيئين
  { w: 'big', field: 'school', at: 's2-4', pictured: 'scene' },
  { w: 'small', field: 'school', at: 's2-4', pictured: 'scene' },
  // س٥-١ الملابس
  { w: 'hat', field: 'clothes', at: 's5-1', face: '🎩' },
  { w: 'shoe', field: 'clothes', at: 's5-1', face: '👟' },
  { w: 'sock', field: 'clothes', at: 's5-1', face: '🧦' },
  { w: 'dress', field: 'clothes', at: 's5-1', sounds: ['d', 'r', 'e', 's'], face: '👗' },
  { w: 'T-shirt', field: 'clothes', at: 's5-1', sounds: ['t', 'ee', 'sh', 'ur', 't'], face: '👕' },
  { w: 'jacket', field: 'clothes', at: 's5-1', sounds: ['j', 'a', 'k', 'i', 't'], face: '🧥' },
  { w: 'jeans', field: 'clothes', at: 's5-1', sounds: ['j', 'ee', 'n', 'z'], face: '👖' },
  { w: 'boots', field: 'clothes', at: 's5-1', sounds: ['b', 'oo', 't', 's'], face: '🥾' },
  { w: 'glasses', field: 'clothes', at: 's5-1', sounds: ['g', 'l', 'a', 's', 'i', 'z'], face: '👓' },
  // س٥-٢ المدرسة واللعب
  { w: 'book', field: 'school', at: 's5-2', face: '📚' },
  { w: 'pen', field: 'school', at: 's5-2', face: '🖊️' },
  { w: 'pencil', field: 'school', at: 's5-2', sounds: ['p', 'e', 'n', 's', 'i', 'l'], face: '✏️' },
  { w: 'ruler', field: 'school', at: 's5-2', sounds: ['r', 'oo', 'l', 'er'], face: '📏' },
  { w: 'school', field: 'school', at: 's5-2', face: '🏫' },
  { w: 'ball', field: 'school', at: 's5-2', sounds: ['b', 'or', 'l'], face: '⚽' },
  { w: 'kite', field: 'school', at: 's5-2', face: '🪁' },
  { w: 'guitar', field: 'school', at: 's5-2', sounds: ['g', 'i', 't', 'ar'], face: '🎸' },
  { w: 'teddy', field: 'school', at: 's5-2', sounds: ['t', 'e', 'd', 'ee'], face: '🧸' },
  { w: 'robot', field: 'school', at: 's5-2', sounds: ['r', 'oa', 'b', 'o', 't'], face: '🤖' },
  { w: 'car', field: 'school', at: 's5-2', face: '🚗' },
  { w: 'train', field: 'school', at: 's5-2', sounds: ['t', 'r', 'ai', 'n'], face: '🚆' },
  { w: 'plane', field: 'school', at: 's5-2', face: '✈️' },
  { w: 'boat', field: 'school', at: 's5-2', sounds: ['b', 'oa', 't'], face: '⛵' },
  { w: 'bike', field: 'school', at: 's5-2', face: '🚲' },
  { w: 'ship', field: 'school', at: 's5-2', face: '🚢' },
  // س٥-٣ البيت أغراضاً
  { w: 'bed', field: 'home', at: 's5-3', face: '🛏️' },
  { w: 'chair', field: 'home', at: 's5-3', face: '🪑' },
  { w: 'door', field: 'home', at: 's5-3', sounds: ['d', 'or'], face: '🚪' },
  { w: 'window', field: 'home', at: 's5-3', sounds: ['w', 'i', 'n', 'd', 'oa'], face: '🪟' },
  { w: 'clock', field: 'home', at: 's5-3', sounds: ['k', 'l', 'o', 'k'], face: '🕰️' },
  { w: 'lamp', field: 'home', at: 's5-3', sounds: ['l', 'a', 'm', 'p'], face: '💡' },
  { w: 'mirror', field: 'home', at: 's5-3', sounds: ['m', 'i', 'r', 'er'], face: '🪞' },
  { w: 'sofa', field: 'home', at: 's5-3', soundless: 'شوا في مقطعها الأخير (/ˈsoʊfə/)', face: '🛋️' },
  { w: 'bath', field: 'home', at: 's5-3', sounds: ['b', 'a', 'th'], face: '🛁' },
  { w: 'box', field: 'home', at: 's5-3', face: '📦' },
  { w: 'phone', field: 'home', at: 's5-3', face: '📱' },
  // س٥-٤ الأماكن والطبيعة
  { w: 'tree', field: 'places', at: 's5-4', face: '🌳' },
  { w: 'flower', field: 'places', at: 's5-4', face: '🌸' },
  { w: 'sun', field: 'places', at: 's5-4', face: '☀️' },
  { w: 'sea', field: 'places', at: 's5-4', face: '🌊' },
  { w: 'beach', field: 'places', at: 's5-4', sounds: ['b', 'ee', 'ch'], face: '🏖️' },
  { w: 'shell', field: 'places', at: 's5-4', face: '🐚' },
  { w: 'street', field: 'places', at: 's5-4', sounds: ['s', 't', 'r', 'ee', 't'], face: '🛣️' },
  { w: 'house', field: 'places', at: 's5-4', sounds: ['h', 'ow', 's'], face: '🏠' },
  { w: 'stop', field: 'places', at: 's5-4', face: '🛑' },
  // س٥-٥ أفعالُ اليوم
  { w: 'eat', field: 'verbs', at: 's5-5', face: '🍽️' },
  { w: 'drink', field: 'verbs', at: 's5-5', sounds: ['d', 'r', 'i', 'ng', 'k'], face: '🥤' },
  { w: 'sleep', field: 'verbs', at: 's5-5', face: '😴' },
  { w: 'read', field: 'verbs', at: 's5-5', face: '📖' },
  { w: 'write', field: 'verbs', at: 's5-5', sounds: ['r', 'igh', 't'], face: '✍️' },
  { w: 'swim', field: 'verbs', at: 's5-5', face: '🏊' },
];

/**
 * **ما لا صورةَ صادقة له: يُرفَع ولا يُتكلَّف** (بندُ الجلسة نصاً). هذه كلماتٌ من
 * حقول `METHOD.md §٤` نفسِها امتنع تصويرُها صدقاً، فلم تدخل محطةً — ويحرس
 * `check_range` ألّا تدخلها لاحقاً بلا قرار. وهي **بندٌ يُرفَع إلى مدير المشروع**.
 */
export const RAISED = [
  // **ومرادفا التحيّة بقيا بعد حكم ١٣ أغسطس**: صارت `hello` و`bye` طقسَ المعلم
  // (`RESOLVED` أدناه)، وطقسٌ **واحد** لا طقسان بمعنىً واحد — فلا موضعَ لمرادفَيهما
  // اليوم، ويدخلان الرصيدَ حين يسمعهما الطفلُ في سياقٍ يرفع اللبس (نصُّ الحكم).
  { w: 'hi', field: 'family', why: 'مرادفُ hello — وطقسُ الافتتاح واحدٌ لا يُثنّى، ولا صورةَ تميّزه' },
  { w: 'goodbye', field: 'family', why: 'مرادفُ bye — وطقسُ الختام واحدٌ كذلك' },
  { w: 'brother', field: 'family', why: '«👦» صورةُ boy لا صورةُ أخٍ — والقرابةُ علاقةٌ لا شكل' },
  { w: 'sister', field: 'family', why: 'كسابقتها مع «👧»' },
  { w: 'body', field: 'body', why: 'لا رمزَ للجسد كلِّه إلا شخصٌ كامل، فيُخلَط بـ boy/girl/man' },
  // **وهاتان بقيتا بعد حكم ١٣ أغسطس بسببٍ زائد**: الحكمُ ينقل «ما له فعلٌ جسديّ»
  // إلى `tpr`، وفعلُهما **لا يُميَّز في صورةِ وضعٍ واحدة**: يدٌ على الرأس ويدٌ في
  // الشعر وضعٌ واحد لعينِ طفل — وهو عينُ اللبس الذي رُفعتا له، منقولاً من الرمز
  // إلى الوضع. فتبقيان حتى تدخلا الرصيدَ عبر جمل س٥-٦ السياقية (نصُّ الحكم).
  { w: 'head', field: 'body', why: 'لا رمزَ لرأسٍ مجرَّد («🗣» وجهٌ يتكلم) — ووضعُ «المس رأسك» يلتبس بـ hair في صورةٍ واحدة' },
  { w: 'hair', field: 'body', why: '«💇» قصُّ شعرٍ لا شَعر — ووضعُ لمسه يلتبس بـ head' },
  { w: 'colour', field: 'colours', why: 'اسمُ جنسٍ لا لون — لا يُصوَّر بمربّعٍ واحد ولا ببقعةٍ واحدة' },
  { w: 'skirt', field: 'clothes', why: '«👗» فستانٌ (dress) — ولا رمزَ للتنّورة وحدَها' },
  { w: 'shirt', field: 'clothes', why: '«👕» قميصُ T-shirt بعينه، وهو مدخلٌ آخر في القائمة' },
  { w: 'bag', field: 'clothes', why: '«👜» حقيبةُ يدٍ (handbag) لا حقيبةً مطلقة' },
  { w: 'zoo', field: 'animals', why: 'لا رمزَ لحديقة حيوان — وأيُّ حيوانٍ يُرسَم يصير اسمَه هو' },
  { w: 'park', field: 'places', why: '«🏞» منظرٌ طبيعيّ يلتبس بـ tree وsea معاً' },
  { w: 'sand', field: 'places', why: '«🏖» شاطئٌ (beach) وهو مدخلٌ آخر' },
];

/**
 * **ما كان مرفوعاً فحُلَّ — بحكمٍ لا باجتهاد** (المدير، ١٣ أغسطس ٢٠٢٦ · `METHOD.md §٤`
 * أحكامُ المادة). و`RAISED` أعلاه **حالُها الجديد** فسقطت منه هذه التسع، وهذا سِجلُّ
 * نسبها: من أين خرجت وإلى أين ذهبت — فلا يعود أحدٌ يسأل «ولِمَ دخلت `pink` وقد
 * رُفعت؟» ولا تُعاد `hello` محطةً مصوَّرة بحسن نيّة.
 *
 * ويحرسه `check_range`: لا كلمةَ في هذا السجلّ باقيةٌ في `RAISED`، وكلٌّ **بلغت
 * مقصدَها فعلاً** (الرصيدَ المصوَّر أو طقسَ المعلم المنطوق).
 */
export const RESOLVED = [
  { w: 'hello', to: 'ritual', why: 'طقسُ المعلم المنطوق: يفتتح كلَّ جلسةٍ بتحيّة — تُكتسَب سماعاً كما يكتسب الطفلُ السلام، بلا سؤالٍ مصوَّرٍ يستحيل جوابُه' },
  { w: 'bye', to: 'ritual', why: 'كسابقتها ختاماً — «Bye bye!» آخرَ كل جلسة' },
  { w: 'pink', to: 'swatch', why: 'بقعةُ لونٍ مُصيَّرة بقيمة لونها — أصدقُ من مربّعٍ ملتبس' },
  { w: 'grey', to: 'swatch', why: 'كسابقتها' },
  { w: 'arm', to: 'act', why: '«point to your arm» — الفعلُ جوابُه: الشخصيةُ تلمس ذراعَها في س٢-٣' },
  { w: 'face', to: 'act', why: '«touch your face» — يدٌ على الوجه وضعٌ يُرى، ولا يلتبس بابتسامةٍ' },
  { w: 'smile', to: 'act', why: '«smile» — ابتسامةٌ تُفعَل لا وجهٌ يُختار' },
];

/**
 * **طقسُ المعلم المنطوق** (حكمُ المدير — `METHOD.md §٤`): «التحياتُ طقسُ المعلم
 * المنطوق لا محطةٌ مصوَّرة: يفتتح المعلمُ كلَّ جلسةٍ بتحيةٍ ويختمها بوداع».
 *
 * فهذان نصّان **إنكليزيان بلا قياسٍ بصريّ**: لا محطةَ لهما ولا مفتاحَ ليتنر ولا
 * سؤال — يُسمعان في موضعهما من كل جلسة محطة (`station.js`)، ويدخلان قائمةَ الصوت
 * كسائر المادّة. ومادّتُهما من الرصيد نفسِه (`hello` · `bye` مدخلان في Starters).
 */
export const RITUAL = { open: 'Hello!', close: 'Bye bye!' };

// ————————————————————————————————————————————————————————————————————————
// ٤) سلّمُ الحرف — Letters and Sounds ‏2007 بمراحله وشائكاته المعدودة
// ————————————————————————————————————————————————————————————————————————

/** مصدرُ السلّم بعينه (وثيقة 00281-2007) — كما في `METHOD.md §٣`. */
export const LS_SOURCE = {
  title: 'Letters and Sounds: Principles and Practice of High Quality Phonics (2007)',
  url: 'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/'
    + 'attachment_data/file/190599/Letters_and_Sounds_-_DFES-00281-2007.pdf',
  pages: { phase2: 48, phase3: 74, phase5: [134, 135] },
};

/**
 * **العهودُ الأربعة وميزانيةُ شائكاتها** (`METHOD.md §٥`: ٥ ← ١٧ ← ٣١ ← ٥٦).
 * والميزانيةُ **رقمُ منهجٍ مكتوب**، والمحصيُّ يُحسب من `GRADES` ويُقابَل به —
 * فمن زاد شائكةً بلا قرارٍ أحمرَّ `check_range` (البابُ الثالث).
 *
 * **و«بلدٌ» في كل عنوان استعارةُ الهوية لا اسمُ عهدٍ ثانٍ** (البند ٥ — الرحلةُ حول
 * العالم): اسمُ العهد المنهجيُّ باقٍ كما هو في `METHOD.md`، ويليه بلدُه على
 * الخريطة. و`eraSection` يشطر ما قبل ` — ` عنواناً وما بعده وصفاً، فالبلدُ في
 * العنوان والوصفُ يقول ما يتعلّمه الطفلُ فيه.
 */
export const ERAS = [
  { id: 'letter1', phase: 2, ar: 'العهد الأول · بلدُ الحروف — تسعةَ عشرَ حرفاً والدمجُ الأول', trickyBudget: 5 },
  { id: 'letter2', phase: 3, ar: 'العهد الثاني · بلدُ الرموز — تمامُ الرموز الأولى', trickyBudget: 17 },
  { id: 'letter3', phase: 4, ar: 'العهد الثالث · بلدُ العناقيد — حرفان يتجاوران بلا صائتٍ بينهما', trickyBudget: 31 },
  { id: 'letter4', phase: 5, ar: 'العهد الرابع · بلدُ البدائل — رسومٌ أخرى للصوت نفسِه', trickyBudget: 56 },
];

/**
 * **الدرجاتُ الستَّ عشرة** — لكلٍّ: رموزُها (`symbols`) وشائكاتُها (`tricky`)
 * وكلماتُها التي **تُفكّ لأول مرّة عندها** (`words`).
 *
 * و`symbols[].id` معرّفٌ فريد للمهارة، و`g` الرسمُ كما يُكتب. وافترقا في موضعين
 * بعلّتهما: **`oo` رسمٌ واحد لصوتين** (boot/look — نصُّ L&S ص٧٤)، و**نطوقُ ح١٦
 * البديلة** (`ow` في cow غيرُها في yellow) — فلو كان المعرّفُ الرسمَ لَعُدَّت `yellow`
 * مفكوكةً عند ح١١، وهي إنما تُفكّ عند ح١٦. فتُكتب مقاطعُ الكلمة **بمعرّفات** الرموز
 * لا برسومها، ويصير حكمُ «رمزٌ فوق درجته» حكماً دقيقاً لا تقريبياً.
 *
 * و`words[].listen` هو **المفتاحُ السمعيّ معلَناً** (عقدُ الجلسة، النقطة ٢).
 */
export const GRADES = [
  {
    id: 'h01', era: 'letter1', ar: 'ح١',
    symbols: [
      { id: 's', g: 's', ex: 'sun' }, { id: 'a', g: 'a', ex: 'cat' },
      { id: 't', g: 't', ex: 'ten' }, { id: 'p', g: 'p', ex: 'pen' },
    ],
    tricky: [],
    // **ولا دمجَ في ح١**: نصُّ `METHOD.md §٥` («الدمجُ بالرموز **من ح٢**») وعينُ
    // جدول L&S الأسبوعي (الدمجُ يبدأ الأسبوعَ الثاني).
    words: [],
  },
  {
    id: 'h02', era: 'letter1', ar: 'ح٢',
    symbols: [
      { id: 'i', g: 'i', ex: 'sit' }, { id: 'n', g: 'n', ex: 'nose' },
      { id: 'm', g: 'm', ex: 'milk' }, { id: 'd', g: 'd', ex: 'dog' },
    ],
    tricky: [],
    words: [
      { w: 'in', gpc: ['i', 'n'], listen: 'word|in|tpr-put' },
      { w: 'sit', gpc: ['s', 'i', 't'], listen: 'verb|sit|tpr-do' },
      { w: 'dad', gpc: ['d', 'a', 'd'], listen: 'word|dad|listen-pick' },
    ],
  },
  {
    id: 'h03', era: 'letter1', ar: 'ح٣',
    symbols: [
      { id: 'g', g: 'g', ex: 'goat' }, { id: 'o', g: 'o', ex: 'dog' },
      { id: 'c', g: 'c', ex: 'cat' }, { id: 'k', g: 'k', ex: 'kite' },
    ],
    tricky: ['the', 'to'],
    words: [
      { w: 'cat', gpc: ['c', 'a', 't'], listen: 'word|cat|listen-pick' },
      { w: 'dog', gpc: ['d', 'o', 'g'], listen: 'word|dog|listen-pick' },
      { w: 'on', gpc: ['o', 'n'], listen: 'word|on|tpr-put' },
    ],
  },
  {
    id: 'h04', era: 'letter1', ar: 'ح٤',
    symbols: [
      { id: 'ck', g: 'ck', ex: 'duck' }, { id: 'e', g: 'e', ex: 'bed' },
      { id: 'u', g: 'u', ex: 'mum' }, { id: 'r', g: 'r', ex: 'red' },
    ],
    tricky: ['no', 'go'],
    words: [
      { w: 'duck', gpc: ['d', 'u', 'ck'], listen: 'word|duck|listen-pick' },
      { w: 'sock', gpc: ['s', 'o', 'ck'], listen: 'word|sock|listen-pick' },
      { w: 'red', gpc: ['r', 'e', 'd'], listen: 'word|red|listen-pick' },
      { w: 'run', gpc: ['r', 'u', 'n'], listen: 'verb|run|tpr-do' },
      { w: 'mum', gpc: ['m', 'u', 'm'], listen: 'word|mum|listen-pick' },
      { w: 'pen', gpc: ['p', 'e', 'n'], listen: 'word|pen|listen-pick' },
      { w: 'sun', gpc: ['s', 'u', 'n'], listen: 'word|sun|listen-pick' },
    ],
  },
  {
    id: 'h05', era: 'letter1', ar: 'ح٥',
    symbols: [
      { id: 'h', g: 'h', ex: 'hat' }, { id: 'b', g: 'b', ex: 'bed' },
      { id: 'f', g: 'f', ex: 'fish' }, { id: 'ff', g: 'ff', ex: 'off' },
      { id: 'l', g: 'l', ex: 'leg' }, { id: 'll', g: 'll', ex: 'bell' },
      { id: 'ss', g: 'ss', ex: 'grass' },
    ],
    tricky: ['I'],
    words: [
      { w: 'hat', gpc: ['h', 'a', 't'], listen: 'word|hat|listen-pick' },
      { w: 'bed', gpc: ['b', 'e', 'd'], listen: 'word|bed|listen-pick' },
      { w: 'leg', gpc: ['l', 'e', 'g'], listen: 'word|leg|listen-pick' },
      { w: 'big', gpc: ['b', 'i', 'g'], listen: 'word|big|tpr-two' },
    ],
  },
  {
    id: 'h06', era: 'letter2', ar: 'ح٦',
    symbols: [
      { id: 'j', g: 'j', ex: 'jump' }, { id: 'v', g: 'v', ex: 'very' },
      { id: 'w', g: 'w', ex: 'window' }, { id: 'x', g: 'x', ex: 'box' },
    ],
    tricky: ['he', 'she'],
    words: [{ w: 'box', gpc: ['b', 'o', 'x'], listen: 'word|box|listen-pick' }],
  },
  {
    id: 'h07', era: 'letter2', ar: 'ح٧',
    symbols: [
      { id: 'y', g: 'y', ex: 'yellow' }, { id: 'z', g: 'z', ex: 'zebra' },
      { id: 'zz', g: 'zz', ex: 'buzz' }, { id: 'qu', g: 'qu', ex: 'queen' },
    ],
    tricky: ['we', 'me', 'be'],
    words: [],
  },
  {
    id: 'h08', era: 'letter2', ar: 'ح٨',
    symbols: [
      { id: 'ch', g: 'ch', ex: 'chip' }, { id: 'sh', g: 'sh', ex: 'shop' },
      { id: 'th', g: 'th', ex: 'thin' }, { id: 'ng', g: 'ng', ex: 'ring' },
    ],
    tricky: ['was', 'my'],
    words: [
      { w: 'fish', gpc: ['f', 'i', 'sh'], listen: 'word|fish|listen-pick' },
      { w: 'ship', gpc: ['sh', 'i', 'p'], listen: 'word|ship|listen-pick' },
      { w: 'shell', gpc: ['sh', 'e', 'll'], listen: 'word|shell|listen-pick' },
    ],
  },
  {
    id: 'h09', era: 'letter2', ar: 'ح٩',
    symbols: [
      { id: 'ai', g: 'ai', ex: 'rain' }, { id: 'ee', g: 'ee', ex: 'feet' },
      { id: 'igh', g: 'igh', ex: 'night' }, { id: 'oa', g: 'oa', ex: 'boat' },
    ],
    tricky: ['you'],
    words: [
      { w: 'sheep', gpc: ['sh', 'ee', 'p'], listen: 'word|sheep|listen-pick' },
      { w: 'bee', gpc: ['b', 'ee'], listen: 'word|bee|listen-pick' },
      { w: 'goat', gpc: ['g', 'oa', 't'], listen: 'word|goat|listen-pick' },
    ],
  },
  {
    id: 'h10', era: 'letter2', ar: 'ح١٠',
    symbols: [
      { id: 'oo', g: 'oo', ex: 'boot' }, { id: 'oo-book', g: 'oo', ex: 'look' },
      { id: 'ar', g: 'ar', ex: 'farm' }, { id: 'or', g: 'or', ex: 'for' },
    ],
    tricky: ['they', 'her'],
    words: [
      { w: 'car', gpc: ['c', 'ar'], listen: 'word|car|listen-pick' },
      { w: 'book', gpc: ['b', 'oo-book', 'k'], listen: 'word|book|listen-pick' },
      { w: 'foot', gpc: ['f', 'oo-book', 't'], listen: 'word|foot|listen-pick' },
    ],
  },
  {
    id: 'h11', era: 'letter2', ar: 'ح١١',
    symbols: [
      { id: 'ur', g: 'ur', ex: 'hurt' }, { id: 'ow', g: 'ow', ex: 'cow' },
      { id: 'oi', g: 'oi', ex: 'coin' }, { id: 'er', g: 'er', ex: 'corner' },
    ],
    tricky: ['all', 'are'],
    words: [{ w: 'cow', gpc: ['c', 'ow'], listen: 'word|cow|listen-pick' }],
  },
  {
    id: 'h12', era: 'letter2', ar: 'ح١٢',
    symbols: [
      { id: 'ear', g: 'ear', ex: 'dear' }, { id: 'air', g: 'air', ex: 'fair' },
      { id: 'ure', g: 'ure', ex: 'sure' },
    ],
    tricky: [],
    words: [
      { w: 'ear', gpc: ['ear'], listen: 'word|ear|listen-pick' },
      { w: 'chair', gpc: ['ch', 'air'], listen: 'word|chair|listen-pick' },
    ],
  },
  {
    // **ولا رمزَ جديداً في ح١٣**: `METHOD.md §٥` («العناقيد بلا رموزٍ جديدة») —
    // الجديدُ أن يتجاور ساكنان، وهو علاجُ إقحام الحركة العربيّ (س٣-٤ سمعاً قبله).
    id: 'h13', era: 'letter3', ar: 'ح١٣', clusters: true,
    // **الصائتُ الأوسط** (`METHOD.md §٨` — شكلُ `haraka`): موضعُه ههنا بنصّ بند
    // الجلسة ٦ في `SESSIONS.md`، وقد صارت الحركاتُ الخمس كلُّها مفكوكةً قبله بعهدين
    // (a في ح١ · i في ح٢ · o في ح٣ · e وu في ح٤) — فيُسأل عن أوسطها في كلمةٍ تُقرأ.
    vowelPairs: ['a-i', 'e-o', 'i-u'],
    symbols: [],
    tricky: ['said', 'so', 'have', 'like', 'some', 'come', 'were', 'there',
      'little', 'one', 'do', 'when', 'out', 'what'],
    words: [
      { w: 'hand', gpc: ['h', 'a', 'n', 'd'], listen: 'word|hand|listen-pick' },
      { w: 'jump', gpc: ['j', 'u', 'm', 'p'], listen: 'verb|jump|tpr-do' },
      { w: 'stand', gpc: ['s', 't', 'a', 'n', 'd'], listen: 'verb|stand|tpr-do' },
      { w: 'clap', gpc: ['c', 'l', 'a', 'p'], listen: 'verb|clap|tpr-do' },
      { w: 'milk', gpc: ['m', 'i', 'l', 'k'], listen: 'word|milk|listen-pick' },
      { w: 'frog', gpc: ['f', 'r', 'o', 'g'], listen: 'word|frog|listen-pick' },
      { w: 'green', gpc: ['g', 'r', 'ee', 'n'], listen: 'word|green|listen-pick' },
      { w: 'tree', gpc: ['t', 'r', 'ee'], listen: 'word|tree|listen-pick' },
      { w: 'stop', gpc: ['s', 't', 'o', 'p'], listen: 'word|stop|listen-pick' },
      { w: 'black', gpc: ['b', 'l', 'a', 'ck'], listen: 'word|black|listen-pick' },
      { w: 'small', gpc: ['s', 'm', 'a', 'll'], listen: 'word|small|tpr-two' },
      { w: 'swim', gpc: ['s', 'w', 'i', 'm'], listen: 'verb|swim|listen-pick' },
      { w: 'sleep', gpc: ['s', 'l', 'ee', 'p'], listen: 'verb|sleep|listen-pick' },
      { w: 'under', gpc: ['u', 'n', 'd', 'er'], listen: 'word|under|tpr-put' },
      { w: 'flower', gpc: ['f', 'l', 'ow', 'er'], listen: 'word|flower|listen-pick' },
      { w: 'brown', gpc: ['b', 'r', 'ow', 'n'], listen: 'word|brown|listen-pick' },
      { w: 'spider', gpc: ['s', 'p', 'i', 'd', 'er'], listen: 'word|spider|listen-pick' },
    ],
  },
  {
    id: 'h14', era: 'letter4', ar: 'ح١٤',
    symbols: [
      { id: 'ay', g: 'ay', ex: 'day' }, { id: 'ou', g: 'ou', ex: 'out' },
      { id: 'ie', g: 'ie', ex: 'tie' }, { id: 'ea', g: 'ea', ex: 'eat' },
      { id: 'oy', g: 'oy', ex: 'boy' }, { id: 'ir', g: 'ir', ex: 'girl' },
      { id: 'ue', g: 'ue', ex: 'blue' }, { id: 'aw', g: 'aw', ex: 'saw' },
    ],
    tricky: ['oh', 'their', 'people', 'Mr', 'Mrs', 'looked', 'called', 'asked'],
    words: [
      { w: 'eat', gpc: ['ea', 't'], listen: 'verb|eat|listen-pick' },
      { w: 'sea', gpc: ['s', 'ea'], listen: 'word|sea|listen-pick' },
      { w: 'read', gpc: ['r', 'ea', 'd'], listen: 'verb|read|listen-pick' },
      { w: 'blue', gpc: ['b', 'l', 'ue'], listen: 'word|blue|listen-pick' },
      { w: 'boy', gpc: ['b', 'oy'], listen: 'word|boy|listen-pick' },
      { w: 'mouth', gpc: ['m', 'ou', 'th'], listen: 'word|mouth|listen-pick' },
      { w: 'girl', gpc: ['g', 'ir', 'l'], listen: 'word|girl|listen-pick' },
      { w: 'bird', gpc: ['b', 'ir', 'd'], listen: 'word|bird|listen-pick' },
    ],
  },
  {
    id: 'h15', era: 'letter4', ar: 'ح١٥',
    symbols: [
      { id: 'wh', g: 'wh', ex: 'when' }, { id: 'ph', g: 'ph', ex: 'photo' },
      { id: 'ew', g: 'ew', ex: 'new' }, { id: 'oe', g: 'oe', ex: 'toe' },
      { id: 'au', g: 'au', ex: 'Paul' }, { id: 'a-e', g: 'a-e', ex: 'make' },
      { id: 'e-e', g: 'e-e', ex: 'these' }, { id: 'i-e', g: 'i-e', ex: 'like' },
      { id: 'o-e', g: 'o-e', ex: 'home' }, { id: 'u-e', g: 'u-e', ex: 'rule' },
    ],
    tricky: ['water', 'where', 'who', 'again', 'thought', 'through', 'work',
      'mouse', 'many'],
    words: [
      { w: 'nose', gpc: ['n', 'o-e', 's'], listen: 'word|nose|listen-pick' },
      { w: 'white', gpc: ['wh', 'i-e', 't'], listen: 'word|white|listen-pick' },
      { w: 'shoe', gpc: ['sh', 'oe'], listen: 'word|shoe|listen-pick' },
      { w: 'plane', gpc: ['p', 'l', 'a-e', 'n'], listen: 'word|plane|listen-pick' },
      { w: 'grape', gpc: ['g', 'r', 'a-e', 'p'], listen: 'word|grape|listen-pick' },
      { w: 'bike', gpc: ['b', 'i-e', 'k'], listen: 'word|bike|listen-pick' },
      { w: 'kite', gpc: ['k', 'i-e', 't'], listen: 'word|kite|listen-pick' },
      { w: 'phone', gpc: ['ph', 'o-e', 'n'], listen: 'word|phone|listen-pick' },
    ],
  },
  {
    // **نطوقٌ بديلة لرموزٍ معلومة** (L&S ص١٣٥) — ولا رسمَ جديداً: المعرّفُ `-alt`
    // والرسمُ نفسُه، فيُقاس تعلُّمُ النطق الثاني ولا يُخلَط بالأول.
    id: 'h16', era: 'letter4', ar: 'ح١٦',
    symbols: [
      { id: 'ow-alt', g: 'ow', ex: 'yellow', alt: 'cow' },
      { id: 'ea-alt', g: 'ea', ex: 'bread', alt: 'eat' },
      { id: 'ch-alt', g: 'ch', ex: 'school', alt: 'chip' },
      { id: 'y-alt', g: 'y', ex: 'family', alt: 'yellow' },
    ],
    tricky: ['laughed', 'because', 'different', 'any', 'eyes', 'friends',
      'once', 'please'],
    words: [
      { w: 'yellow', gpc: ['y', 'e', 'll', 'ow-alt'], listen: 'word|yellow|listen-pick' },
      { w: 'bread', gpc: ['b', 'r', 'ea-alt', 'd'], listen: 'word|bread|listen-pick' },
      { w: 'school', gpc: ['s', 'ch-alt', 'oo', 'l'], listen: 'word|school|listen-pick' },
      { w: 'family', gpc: ['f', 'a', 'm', 'i', 'l', 'y-alt'], listen: 'word|family|listen-pick' },
    ],
  },
];

/**
 * ————— **الشائكاتُ بطريقة heart words** (`METHOD.md §٥`) —————
 *
 * «شائكاتُها المعدودة إن وُجدت بطريقة heart words (فكُّ المنتظم ووسمُ الشوكة)»،
 * و`§١٢-١`: «كلُّ شائكةٍ **مفكوكةٌ إلا موضعَ شوكتها**». فلكلِّ شائكةٍ **مقاطعُ رسمها**
 * و**موضعُ شوكتها** — وهما بيانٌ يُكتب، لأنّ الشوكة لا تُستنتَج من الرسم: في `to`
 * الشوكةُ `o` (تقول ‏/oo/ لا ‏/o/)، وفي `the` الشوكةُ `e` (تقول شوَا)، وفي `I` الكلمةُ
 * كلُّها شوكة.
 *
 * **والوسمُ يُحسَب بدرجة المحطة لا يُكتب هنا** (`markedTricky` أدناه): المقطعُ يُنقَّط
 * **إن كان رمزُه مفتوحاً عند تلك الدرجة** — فـ`th` في `the` عند ح٣ لا نقطةَ له (رمزُه
 * يُفتَح في ح٨) وله نقطةٌ يومَ يُفتَح. ولو كُتب الوسمُ بياناً ثابتاً لَكذب على الطفل
 * في إحدى الدرجتين: «هذا تفكّه» وهو لم يتعلّمه بعد.
 *
 * **ولا تدخل مقاطعُ الشائكة جردَ الرموز**: هي الخرقُ المعلَن الوحيد للمفكوكية
 * (`METHOD.md §١٢-١`) بميزانيةٍ معدودة — فتُجرَد **شائكةً** على ميزانيتها، لا رسوماً
 * على السلّم (وإلّا لَاستحال تدريسُ `the` عند ح٣ أبداً).
 *
 * **ولكلٍّ سياقٌ مسموعٌ مألوف** (`say` — نصُّ `METHOD.md §٦`: «وتُدرَّس داخل سياقٍ
 * مسموعٍ مألوف (‏the cat…) لا معزولةً»): كلماتُه كلُّها مداخلُ Starters يجردها
 * `check_range` كما يجرد الأمرَ المنطوق، فلا يدخل أذنَ الطفل ما ليس من قائمته.
 *
 * ————— **والشائكاتُ درجتان لا استثناءٌ واحد** (حكمُ المدير · `METHOD.md §٦`) —————
 *
 * «الشائكةُ **ذاتُ المدخل في الرصيد السمعي** (he · she · we · you…) يسري عليها القيدُ
 * كسائر الكلمات — فمعناها يُتقَن سمعاً قبل أن تُقرأ؛ والمستثنى **كلماتُ الوظيفة
 * الصرفة بلا مدخلٍ سمعيّ** (the · to · was · are…) بميزانيتها المعدودة وعلّتها
 * المعلنة». فلكلِّ شائكةٍ **أحدُ الحقلين لا كلاهما ولا واحدَ منهما**:
 *   • `listen` — مفتاحُها السمعيّ، **بشكل مفاتيح الرصيد نفسِه** (`word|he|listen-pick`):
 *     معناها يُقاس سمعاً ثم تُقرأ، فيحكمها `readableTrickyAt` كما يحكم `readableAt`
 *     كلماتِ القراءة.
 *   • `why` — علّةُ استثنائها مكتوبةً: كلمةُ وظيفةٍ لا معنى مصوَّرَ لها ولا يُقاس
 *     فهمُها بصورةٍ تُلمَس، فتُدرَّس **داخل سياقٍ مسموع** (`say`) بميزانيةٍ معدودة.
 * ويحرس `check_range` تمامَ الإعلان، و`check_coupling` أثرَه (سالباً بدسّة).
 *
 * **وموضعُ الشوكة قد يكون موضعين** (`was`: ‏`a` تقول /o/ و`s` تقول /z/): فـ`heart`
 * رقمٌ أو قائمةُ أرقام — والوسمُ يتبعه، ولا تُدفَن شوكةٌ ثانية بسكوتٍ عنها.
 */
export const HEART_WORDS = {
  // ————— العهدُ الأول (ح٣–ح٥) — كلماتُ وظيفةٍ صرفة كلُّها —————
  the: { parts: ['th', 'e'], heart: 1, say: 'the cat',
    why: 'أداةُ تعريفٍ لا معنى مصوَّرَ لها — تُسمَع في كل جملةٍ توجَّه إلى الطفل' },
  to: { parts: ['t', 'o'], heart: 1, say: 'go to bed',
    why: 'حرفٌ لا مدخلَ سمعياً مستقلاً له — معناه في الجملة لا في صورة' },
  no: { parts: ['n', 'o'], heart: 1, say: 'no, it is not a dog',
    why: 'أداةُ نفيٍ — لا صورةَ تُلمَس لها، وتُفهَم في سياق الجواب' },
  go: { parts: ['g', 'o'], heart: 1, say: 'go to the door',
    why: 'فعلُ ذهابٍ لا وضعَ مرسومَ له في س٢-٣ (وليس من أفعال حقلها)' },
  I: { parts: ['I'], heart: 0, say: 'I can run',
    why: 'ضميرُ المتكلم — مرجعُه المتكلمُ نفسُه، فلا صورةَ له تُلمَس ولا محطةَ تقيسه' },
  // ————— العهدُ الثاني (ح٦–ح١٢) — ثنتا عشرةَ شائكة (← ١٧) —————
  //
  // **وثمانٍ منها ضمائرُ ذاتُ مدخلٍ في Starters** (he · she · we · me · you · they ·
  // her · my): مرجعُها **يُرى ويُسمّى** (هو · هي · نحن…)، فمعناها يُقاس سمعاً —
  // ويسري عليها القيدُ. **وأربعٌ وظيفةٌ صرفة**: صيغُ الكون الثلاث و`all`.
  he: { parts: ['h', 'e'], heart: 1, say: 'he is my friend',
    listen: 'word|he|listen-pick' },
  she: { parts: ['sh', 'e'], heart: 1, say: 'she is happy',
    listen: 'word|she|listen-pick' },
  we: { parts: ['w', 'e'], heart: 1, say: 'we can jump',
    listen: 'word|we|listen-pick' },
  me: { parts: ['m', 'e'], heart: 1, say: 'look at me',
    listen: 'word|me|listen-pick' },
  be: { parts: ['b', 'e'], heart: 1, say: 'be happy',
    why: 'صيغةُ كونٍ (be · was · are): وظيفةٌ صرفة لا معنى مصوَّرَ لها — ونصُّ §٦ '
      + 'يسمّي `was` و`are` مستثنيتين، و`be` أصلُهما' },
  was: { parts: ['w', 'a', 's'], heart: [1, 2], say: 'it was in the box',
    why: 'صيغةُ كونٍ ماضية — استثناها نصُّ §٦ باسمها' },
  my: { parts: ['m', 'y'], heart: 1, say: 'my ball is red',
    listen: 'word|my|listen-pick' },
  you: { parts: ['y', 'ou'], heart: 1, say: 'you are my friend',
    listen: 'word|you|listen-pick' },
  they: { parts: ['th', 'ey'], heart: 1, say: 'they are happy',
    listen: 'word|they|listen-pick' },
  her: { parts: ['h', 'er'], heart: 1, say: 'her hat is big',
    listen: 'word|her|listen-pick' },
  all: { parts: ['a', 'll'], heart: 0, say: 'we are all here',
    why: 'مُحدِّدُ كمٍّ — وليس من مداخل Starters ‏2025 أصلاً، فلا مفتاحَ سمعياً له' },
  are: { parts: ['ar', 'e'], heart: 1, say: 'we are happy',
    why: 'صيغةُ كونٍ — استثناها نصُّ §٦ باسمها' },
  // ————— العهدُ الثالث (ح١٣) — أربعَ عشرةَ شائكة (← ٣١) —————
  //
  // **وواحدةٌ منها ذاتُ مدخلٍ ومحطتُها قائمةٌ اليوم**: `one` عددٌ يُعَدّ في س١-٦
  // (‏`word|one|listen-pick` — مفتاحٌ حيٌّ لا نائم)، فيسري عليها القيدُ **ويعمل من
  // يومه**. وسائرُها كلماتُ وظيفةٍ ونحوٍ لا مدخلَ مصوَّرَ لها، أو ليست من مداخل
  // Starters ‏2025 أصلاً — ولكلٍّ علّتُها مكتوبة (معيارُ التصنيف المُقَرّ، قبولُ
  // الجلسة ٥ البند ٢).
  //
  // **ومقاطعُ الرسم تُكتب كما تُنطَق لا كما تُهجّى**: `there` مقطعان (‏/ð/ و/air/)
  // لا أربعة، و`little` آخرُها `le` يقول /l/ — والوسمُ يتبع الرسمَ الحقيقيّ.
  said: { parts: ['s', 'ai', 'd'], heart: 1, say: 'she said no',
    why: 'فعلُ قولٍ ماضٍ لا صورةَ له تُلمَس، وليس من مداخل Starters ‏2025' },
  so: { parts: ['s', 'o'], heart: 1, say: 'it is so big',
    why: 'أداةُ توكيدٍ ودرجة — معناها في الجملة لا في صورة' },
  have: { parts: ['h', 'a', 'v', 'e'], heart: 3, say: 'we have a cat',
    why: 'فعلُ ملكيةٍ ومساعد — لا وضعَ مرسومَ له ولا صورة' },
  like: { parts: ['l', 'i', 'k', 'e'], heart: [1, 3], say: 'we like milk',
    why: 'فعلُ ميلٍ — شعورٌ لا يُصوَّر، ولا يُقاس فهمُه بصورةٍ تُلمَس' },
  some: { parts: ['s', 'o', 'm', 'e'], heart: [1, 3], say: 'we have some milk',
    why: 'مُحدِّدُ كمٍّ كـ`all` — لا صورةَ له تُلمَس' },
  come: { parts: ['c', 'o', 'm', 'e'], heart: [1, 3], say: 'come to me',
    why: 'فعلُ إقبالٍ لا وضعَ مرسومَ له في س٢-٣ (وليس من أفعال حقلها)' },
  were: { parts: ['w', 'er', 'e'], heart: 2, say: 'we were happy',
    why: 'صيغةُ كونٍ ماضية (be · was · are · were) — أسرةٌ استثناها نصُّ §٦' },
  there: { parts: ['th', 'ere'], heart: 1, say: 'the cat is there',
    why: 'ظرفُ إشارةٍ ووجود — معناه علاقةٌ لا شيءٌ يُصوَّر' },
  little: { parts: ['l', 'i', 'tt', 'le'], heart: [2, 3], say: 'a little dog',
    why: 'صفةُ حجمٍ ليست من مداخل Starters ‏2025 (وفيها `small`)، فلا مفتاحَ سمعياً '
      + 'لها — ولو دخلت القائمةَ يوماً سرى عليها القيد' },
  one: { parts: ['o', 'n', 'e'], heart: [0, 2], say: 'we have one ball',
    listen: 'word|one|listen-pick' },
  do: { parts: ['d', 'o'], heart: 1, say: 'what do you see',
    why: 'فعلٌ مساعد في السؤال — لا معنى مصوَّرَ له' },
  when: { parts: ['wh', 'e', 'n'], heart: 0, say: 'when do we play',
    why: 'أداةُ سؤالٍ عن الزمن — لا صورةَ لها، وليست من مداخل Starters ‏2025' },
  out: { parts: ['ou', 't'], heart: 0, say: 'the cat is out',
    why: 'ظرفُ مكانٍ ليس من مداخل Starters ‏2025 (وفيها `in` و`on` و`under`)' },
  what: { parts: ['wh', 'a', 't'], heart: [0, 1], say: 'what is it',
    why: 'أداةُ سؤالٍ — لا معنى مصوَّرَ لها، وتُسمَع في كل جملةٍ تُوجَّه إلى الطفل' },
  // ————— العهدُ الرابع (ح١٤–ح١٦) — خمسٌ وعشرون شائكة (← ٥٦) —————
  //
  // مصدرُها وثيقة L&S ص١٣٢–١٣٣ نصاً (`METHOD.md §١٢-١١`)، وهي **أثقلُ ميزانيةٍ في
  // الرحلة**: أكثرُها صيغٌ صرفية (‏`-ed` تقول /t/ أو /d/) أو رسومٌ ماتت في الإنكليزية
  // الحديثة (‏`ough` · `augh`) — فالشوكةُ فيها موضعٌ أو ثلاثة، والوسمُ يتبعها كلَّها.
  //
  // **وتصنيفُ الدرجتين مطبَّقٌ بالبيانات كما مضى**: تحت القيد ما لمعناه **مدخلٌ
  // مصوَّرٌ صادق** في رصيدنا فيُقاس سمعُه (`water` — محطتُها س١-٤ حيّة؛ و`their`
  // ملكيةٌ تُرى في مشهد س٥-٦ الذي بُني اليوم)، ومستثناةٌ **بعلّتها المكتوبة** كلمةُ
  // الوظيفة والصيغةُ الصرفية وما لا صورةَ صادقة له (سابقةُ `body` المرفوعة) وما ليس
  // من مداخل Starters ‏2025 أصلاً (سابقتا `all` و`little`). **وثلاثٌ من مداخل
  // Starters لا مدخلَ مصوَّرَ لها في رصيدنا اليوم** (`people` · `mouse` · `please`)
  // — علّتُها مكتوبة، ولو دخلت الرصيدَ يوماً سرى عليها القيد (بندٌ يُرفَع).
  oh: { parts: ['o', 'h'], heart: [0, 1], say: 'oh, the dog is big',
    why: 'صوتُ تعجُّبٍ لا معنى مصوَّرَ له يُلمَس' },
  their: { parts: ['th', 'eir'], heart: 1, say: 'their ball is red',
    listen: 'word|their|listen-pick' },
  people: { parts: ['p', 'eo', 'p', 'le'], heart: [1, 3], say: 'the people are happy',
    why: 'اسمُ جماعةٍ لا صورةَ صادقة له: كلُّ رمزٍ لجماعةٍ في رصيدنا أسرةٌ أو صديقان '
      + 'باسمهما (سابقةُ `body` في `RAISED`) — فلا مفتاحَ سمعياً له اليوم' },
  Mr: { parts: ['M', 'r'], heart: [0, 1], say: 'Mr Green is my friend',
    why: 'اختصارُ لقبٍ لا كلمة — لا يُفكّ مقطعٌ منه ولا صورةَ له' },
  Mrs: { parts: ['M', 'rs'], heart: [0, 1], say: 'Mrs Green is here',
    why: 'كسابقه' },
  looked: { parts: ['l', 'oo', 'k', 'ed'], heart: 3,
    say: 'she looked at me',
    why: 'صيغةُ ماضٍ (‏`-ed` تقول /t/) — الصيغةُ الصرفية لا مدخلَ مستقلاً لها في '
      + 'الرصيد، وليست من مداخل Starters ‏2025' },
  called: { parts: ['c', 'a', 'll', 'ed'], heart: [1, 3], say: 'mum called me',
    why: 'كسابقتها، و`a` فيها تقول /or/' },
  asked: { parts: ['a', 's', 'k', 'ed'], heart: 3, say: 'I asked my friend',
    why: 'كسابقتها' },
  water: { parts: ['w', 'a', 't', 'er'], heart: 1, say: 'I can see the water',
    listen: 'word|water|listen-pick' },
  where: { parts: ['wh', 'ere'], heart: 1, say: 'where is my ball',
    why: 'أداةُ سؤالٍ عن المكان — لا صورةَ لها تُلمَس' },
  who: { parts: ['wh', 'o'], heart: [0, 1], say: 'who is happy',
    why: 'أداةُ سؤالٍ عن الشخص — لا صورةَ لها' },
  again: { parts: ['a', 'g', 'ai', 'n'], heart: 0, say: 'do it again',
    why: 'ظرفُ تكرارٍ — معناه في الفعل لا في صورة' },
  thought: { parts: ['th', 'ough', 't'], heart: 1, say: 'I thought so',
    why: 'فعلُ ظنٍّ ماضٍ لا يُصوَّر، وليس من مداخل Starters ‏2025' },
  through: { parts: ['th', 'r', 'ough'], heart: 2, say: 'we go through the door',
    why: 'حرفُ عبورٍ — علاقةٌ لا شيءٌ يُصوَّر، وليس من مداخل Starters ‏2025' },
  work: { parts: ['w', 'or', 'k'], heart: 1, say: 'my mum can work',
    why: 'فعلٌ عامّ لا وضعَ مرسومَ له في س٢-٣، وليس من مداخل Starters ‏2025' },
  mouse: { parts: ['m', 'ou', 'se'], heart: 2, say: 'the mouse is in the box',
    why: 'من مداخل Starters ولا مدخلَ لها في رصيدنا المصوَّر اليوم — فلا مفتاحَ '
      + 'سمعياً لها (سابقةُ `little`)، ولو دخلته سرى عليها القيد' },
  many: { parts: ['m', 'a', 'n', 'y'], heart: [1, 3], say: 'many people are happy',
    why: 'مُحدِّدُ كمٍّ كـ`all` و`some` — لا صورةَ له تُلمَس' },
  laughed: { parts: ['l', 'au', 'gh', 'ed'], heart: [1, 2, 3], say: 'we laughed at the dog',
    why: 'صيغةُ ماضٍ برسمٍ ميّت (‏`augh`)، وليست من مداخل Starters ‏2025' },
  because: { parts: ['b', 'e', 'c', 'au', 'se'], heart: [1, 4],
    say: 'I am happy because I can play',
    why: 'أداةُ تعليلٍ — علاقةٌ لا صورة، وليست من مداخل Starters ‏2025' },
  different: { parts: ['d', 'i', 'ff', 'er', 'e', 'n', 't'], heart: 4,
    say: 'my ball is different',
    why: 'صفةُ مقارنةٍ لا تُصوَّر بصورةٍ واحدة، وليست من مداخل Starters ‏2025' },
  any: { parts: ['a', 'n', 'y'], heart: [0, 2], say: 'do you have any milk',
    why: 'مُحدِّدُ كمٍّ — لا صورةَ له، وليس من مداخل Starters ‏2025' },
  eyes: { parts: ['eye', 's'], heart: 0, say: 'my eyes are big',
    why: 'جمعُ `eye` — والمفتاحُ السمعيُّ مدَاه الكلمةُ نفسُها، ومدخلُ رصيدنا المفرد '
      + '(سابقةُ `little`: الحاكمُ بياناتُ `curriculum.js`)' },
  friends: { parts: ['f', 'r', 'ie', 'n', 'd', 's'], heart: 2, say: 'we are friends',
    why: 'جمعُ `friend` — كسابقتها' },
  once: { parts: ['o', 'n', 'ce'], heart: [0, 2], say: 'do it once',
    why: 'ظرفُ مرّةٍ — لا صورةَ له، وليس من مداخل Starters ‏2025' },
  please: { parts: ['p', 'l', 'ea', 'se'], heart: 3, say: 'come here please',
    why: 'أداةُ طلبٍ مهذَّب — لا صورةَ لها تُلمَس ولا مدخلَ مصوَّراً في رصيدنا' },
};

/**
 * **الرموزُ الصائتة** — قائمةٌ مُعلَنة لا تُشتقّ من شكل الرسم.
 *
 * وعلّةُ وجودها بابٌ في الفاحص: **المرحلةُ ٤ (ح١٣) لا رمزَ جديدَ فيها**، وإنما
 * الجديدُ أن **يتجاور ساكنان** (CVCC/CCVC — `METHOD.md §٥`). فبلا معرفةِ الصائت من
 * الساكن يُحسَب `stand` مفكوكاً عند ح٢ (رموزُه كلُّها مفتوحة هناك) وهو إنّما يُفكّ
 * عند ح١٣ — وذلك عينُ ما يُقحِم الحركةَ العربيةَ في العنقود (علّةُ س٣-٤).
 */
export const VOWEL_SYMBOLS = new Set([
  'a', 'e', 'i', 'o', 'u',
  'ai', 'ee', 'igh', 'oa', 'oo', 'oo-book', 'ar', 'or',
  'ur', 'ow', 'oi', 'er', 'ear', 'air', 'ure',
  'ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw',
  'ew', 'oe', 'au', 'a-e', 'e-e', 'i-e', 'o-e', 'u-e',
  // ونطوقُ ح١٦: `ow` في yellow صائتٌ كأصله، و`ea` في bread كذلك، و`y` في family
  // صائتٌ (‏/i/) وإن كان `y` في yellow ساكناً (‏/j/) — وهو عينُ سبب تفريق المعرّفات.
  'ow-alt', 'ea-alt', 'y-alt',
]);

/**
 * درجةُ العناقيد — التي تفتح تجاورَ الساكنين (وتُعلن `clusters: true`).
 *
 * **والقاعدةُ نفسُها ليست هنا بل في `check_range.py` وحدَه**: هذه بياناتٌ (أيُّ رمزٍ
 * صائتٌ، وأيُّ درجةٍ تفتح التجاور) وتلك حكمٌ يُطبَّق عليها — ولو كُتب الحكمُ في
 * الموضعين لصار للحقيقة مصدران يفترقان بلا حارس.
 */
export const CLUSTER_GRADE = 'h13';

/**
 * ————— **القصصُ شبهُ المفكوكة** (`METHOD.md §٥` و§٧) —————
 *
 * «نصٌّ قصير مصوَّر كلُّه من رموز الدرجات المفتوحة + شائكاتها — يفحصه `check_range`
 * ككل تمرين»، ومفتاحُه `text|<درجة>|read`. **وهذه الجلسةُ (٦) تكتب أوّلَها** (ح٦)،
 * ورصيدُ بقيةِ الدرجات بندُ الجلسة ٧.
 *
 * ولكلِّ صفحةٍ سطرُها وصورتُها: `text` ما يُقرأ، و`pick` الكلمةُ التي **تُلمَس صورتُها
 * بعد قراءته** — ومن كلماته هو (فلا يُسأل الطفلُ عمّا لم يقرأ)، ولها صورةٌ مفردة.
 *
 * ————— وأربعةُ قيودٍ في نصّها، كلُّها من قيودنا القائمة —————
 *
 * ١) **لا كلمةَ إلا كلمةُ قراءةٍ مفتوحةٌ أو شائكةٌ مفتوحة** — نصُّ §٥ حرفاً، ويحرسه
 *    `check_range` (بابُ القصة والأبوابُ الثلاثة معاً، مُجرَّباً سالباً).
 * ٢) **وقيدُ الاقتران يحكمها ككلِّ تمرين قراءة** (`METHOD.md §٦` يسمّي `text` معه):
 *    فالقصةُ **لا تُعرَض** حتى تنضج كلماتُها كلُّها سمعاً — لا تُنقَص كلمةٌ منها ولا
 *    تُبدَّل، فهي نصٌّ لا حوضُ توليد (`story.js`).
 * ٣) **حروفُها صغيرةٌ كلُّها إلا `I`**: الحرفُ الكبير **رسمٌ لم يُدرَّس في السلّم**،
 *    و`T` ليست `t` في عين طفلٍ يفكّ أوّلَ سنته — و`I` شائكةٌ رسمُها هو نفسُه
 *    (`HEART_WORDS.I`: الكلمةُ كلُّها شوكة). (بندٌ يُرفَع.)
 * ٤) **ولا علاماتِ وقف**: `METHOD.md §٨` تستثنيها من التأسيس نصّاً («المستبعَد …
 *    وعلاماتُ الوقف») — فلا يُعرَض على الطفل ما لم يُدرَّس.
 */
export const STORIES = {
  // ح٦ — كلماتُها من ح٢–ح٦ (run · box · sit · in · big · dog · mum · bed)
  // وشائكاتُها من ح٣–ح٥ (the · to · I · go): **وظيفةٌ صرفة كلُّها**، فلا تنتظر
  // القصةُ محطةَ he/she السمعية النائمة (حكمُ قبول الجلسة ٥ البند ١).
  h06: {
    title: 'الصندوقُ والكلب',
    pages: [
      { text: 'I run to the box', pick: 'box' },
      { text: 'I sit in the box', pick: 'sit' },
      { text: 'the big dog', pick: 'dog' },
      { text: 'I run to mum', pick: 'mum' },
      { text: 'I go to bed', pick: 'bed' },
    ],
  },
  // ————— **رصيدُ القصص: كتابٌ لكل درجةٍ** (الجلسة ٧ · `METHOD.md §٥`) —————
  //
  // ولكلِّ قصةٍ **حوضُها هو حوضُ درجتها**: كلماتُ القراءة المفتوحة عندها وشائكاتُها
  // لا غير (يفحصه `check_range`)، فتنمو الجملةُ بنموّ السلّم — قصةُ ح٧ ثلاثُ كلماتٍ
  // في السطر وقصةُ ح١٦ جملةٌ تامّة. **ولا فعلَ كونٍ فيها** (`is` · `a`): ليسا في
  // السلّم، فلا يُعرَض ما لم يُدرَّس ولو كان أشيعَ حرفين في الإنكليزية.
  //
  // **وشائكاتُ الضمائر الأربعُ النائمة خارجها عمداً** (`we` · `me` · `my` · `you`):
  // القصةُ نصٌّ **كلُّه أو لا شيء**، فكلمةٌ لا يمكن أن تنضج سمعاً اليومَ تحبس القصةَ
  // كلَّها إلى الأبد — وهو عينُ ثقب القفل الذي سُدّ في الجلسة ٦.
  h07: {
    title: 'البطةُ والجورب',
    pages: [
      { text: 'the duck on the bed', pick: 'duck' },
      { text: 'the red sock in the box', pick: 'sock' },
      { text: 'I run to the sun', pick: 'sun' },
      { text: 'I go to dad', pick: 'dad' },
    ],
  },
  h08: {
    title: 'السمكةُ والسفينة',
    pages: [
      { text: 'the fish in the ship', pick: 'fish' },
      { text: 'the shell in the box', pick: 'shell' },
      { text: 'the ship was big', pick: 'ship' },
      { text: 'I run to the fish', pick: 'fish' },
    ],
  },
  h09: {
    title: 'الخروفُ والنحلة',
    pages: [
      { text: 'the sheep in the sun', pick: 'sheep' },
      { text: 'the bee on the sheep', pick: 'bee' },
      { text: 'the goat was on the bed', pick: 'goat' },
      { text: 'I run to the goat', pick: 'goat' },
    ],
  },
  h10: {
    title: 'الكتابُ في السيارة',
    pages: [
      { text: 'the book in the car', pick: 'book' },
      { text: 'her book was red', pick: 'book' },
      { text: 'the cat on the car', pick: 'cat' },
      { text: 'they go to the car', pick: 'car' },
    ],
  },
  h11: {
    title: 'البقرةُ الكبيرة',
    pages: [
      { text: 'the big cow', pick: 'cow' },
      { text: 'the cow in the car', pick: 'car' },
      { text: 'the cow on the bed', pick: 'bed' },
      { text: 'I run to the cow', pick: 'cow' },
    ],
  },
  h12: {
    title: 'الكرسيُّ والبقرة',
    pages: [
      { text: 'the cat on the chair', pick: 'cat' },
      { text: 'the cow on the chair', pick: 'cow' },
      { text: 'her chair was red', pick: 'chair' },
      { text: 'I sit on the chair', pick: 'chair' },
    ],
  },
  h13: {
    title: 'الضفدعُ والشجرة',
    pages: [
      { text: 'the frog on the tree', pick: 'frog' },
      { text: 'the green tree', pick: 'tree' },
      { text: 'the frog said no', pick: 'frog' },
      { text: 'I have one frog', pick: 'frog' },
      { text: 'the spider was there', pick: 'spider' },
    ],
  },
  h14: {
    title: 'الطائرُ والبحر',
    pages: [
      { text: 'the bird on the sea', pick: 'bird' },
      { text: 'the blue sea', pick: 'sea' },
      { text: 'the girl called the bird', pick: 'girl' },
      { text: 'the boy asked mum', pick: 'boy' },
      { text: 'their bird was blue', pick: 'bird' },
    ],
  },
  h15: {
    title: 'الطائرةُ والماء',
    pages: [
      { text: 'the plane on the sea', pick: 'plane' },
      { text: 'the white kite', pick: 'kite' },
      { text: 'the boy looked again', pick: 'boy' },
      { text: 'the water on the shoe', pick: 'shoe' },
      { text: 'I read the book again', pick: 'book' },
    ],
  },
  h16: {
    title: 'المدرسةُ الصفراء',
    pages: [
      { text: 'the yellow school', pick: 'school' },
      { text: 'the family in the car', pick: 'family' },
      { text: 'I eat the bread', pick: 'bread' },
      { text: 'the family called the girl', pick: 'girl' },
      { text: 'they go to school', pick: 'school' },
    ],
  },
};

// ————————————————————————————————————————————————————————————————————————
// ٤ب) أصواتُ اللغة — **الرمزُ رسمٌ والصوتُ مهارة** (مادّةُ س٣ وس٤)
// ————————————————————————————————————————————————————————————————————————
//
// **العلّة، وهي علّةُ س٤ نفسِها**: «الأذنُ الفونيمية … بلا حرفٍ مرسوم إطلاقاً»
// (`METHOD.md §٤`) — والسؤالُ فيها «أيُّ الصور تبدأ بـ/s/؟» سؤالٌ عن **صوت**، فلو
// جُمعت الكلماتُ برسمها لَصار `cat` و`kite` صوتَين مختلفين وهما صوتٌ واحد، ولَصار
// `kite` **جواباً صحيحاً** في سؤالٍ عن مدىً آخر — خطأٌ لا يُمسَك بحارس رسم.
//
// فهذا جدولُ **الأربعة والأربعين صوتاً** بمجموعات L&S (وثيقة 00281-2007 — جدولُ
// الفونيمات وبدائلُ رسومها في المرحلة ٥، ص١٣٤–١٣٥): لكلِّ صوتٍ **رسومُه** التي
// تُنطَق به. ومنه يُشتقّ صوتُ كل رمزٍ في السلّم، فلا رمزَ بلا صوت (يحرسه
// `check_range.py`).
//
// **و`say` نصُّه المنطوق** — وهو مفتاحُ ملفّه في قائمة الصوت (`docs/AUDIO_QUEUE.md`،
// الفئة `phoneme`: «الأصواتُ المعزولة `/s/ /a/ /t/`»)، فيلزم أن يكون **فريداً**: نصّان
// متطابقان يتقاسمان ملفاً واحداً فيُسمع صوتٌ مكانَ صوت. **والرسمُ الحرفيّ يشترك فيه
// صوتان** (`oo` في boot غيرُها في book — نصُّ L&S ص٧٤)، فأُفرد الثاني بعلامته الصوتية
// الدولية `/ʊ/` وحدَه: استثناءٌ واحد معلَنٌ بعلّته، لا لسانٌ ثانٍ في الجدول.
//
// **ونقاءُ نطق الصوت المعزول شأنُ جلسة ص** (`SESSIONS.md`): البنكُ غيرُ مولَّد،
// والاحتياطُ الناطق قد يلفظ **اسمَ الحرف** لا صوتَه — نقصُ نقاءٍ معلومٌ مقبولٌ
// مؤقتاً، لا يُجتهَد في حلّه بتوليد صوتٍ هنا (عهدُ `AUDIO_QUEUE.md`).

export const PHONEMES = [
  // الصوامتُ الأربعةُ والعشرون
  { id: 's', say: '/s/', ex: 'sun', graphemes: ['s', 'ss'] },
  { id: 't', say: '/t/', ex: 'tree', graphemes: ['t'] },
  { id: 'p', say: '/p/', ex: 'pen', graphemes: ['p'] },
  { id: 'n', say: '/n/', ex: 'nose', graphemes: ['n'] },
  { id: 'm', say: '/m/', ex: 'mum', graphemes: ['m'] },
  { id: 'd', say: '/d/', ex: 'dog', graphemes: ['d'] },
  { id: 'g', say: '/g/', ex: 'goat', graphemes: ['g'] },
  { id: 'k', say: '/k/', ex: 'cat', graphemes: ['c', 'k', 'ck', 'ch-alt'] },
  { id: 'r', say: '/r/', ex: 'red', graphemes: ['r'] },
  { id: 'h', say: '/h/', ex: 'hat', graphemes: ['h'] },
  { id: 'b', say: '/b/', ex: 'bed', graphemes: ['b'] },
  { id: 'f', say: '/f/', ex: 'fish', graphemes: ['f', 'ff', 'ph'] },
  { id: 'l', say: '/l/', ex: 'leg', graphemes: ['l', 'll'] },
  { id: 'j', say: '/j/', ex: 'jump', graphemes: ['j'] },
  { id: 'v', say: '/v/', ex: 'very', graphemes: ['v'] },
  { id: 'w', say: '/w/', ex: 'white', graphemes: ['w', 'wh'] },
  { id: 'ks', say: '/ks/', ex: 'box', graphemes: ['x'] },
  { id: 'y', say: '/y/', ex: 'yellow', graphemes: ['y'] },
  { id: 'z', say: '/z/', ex: 'zebra', graphemes: ['z', 'zz'] },
  { id: 'kw', say: '/kw/', ex: 'queen', graphemes: ['qu'] },
  { id: 'ch', say: '/ch/', ex: 'chair', graphemes: ['ch'] },
  { id: 'sh', say: '/sh/', ex: 'ship', graphemes: ['sh'] },
  { id: 'th', say: '/th/', ex: 'mouth', graphemes: ['th'] },
  { id: 'ng', say: '/ng/', ex: 'ring', graphemes: ['ng'] },
  // الصوائتُ العشرون
  { id: 'a', say: '/a/', ex: 'cat', graphemes: ['a'] },
  { id: 'e', say: '/e/', ex: 'bed', graphemes: ['e', 'ea-alt'] },
  { id: 'i', say: '/i/', ex: 'fish', graphemes: ['i'] },
  { id: 'o', say: '/o/', ex: 'dog', graphemes: ['o'] },
  { id: 'u', say: '/u/', ex: 'duck', graphemes: ['u'] },
  { id: 'ai', say: '/ai/', ex: 'plane', graphemes: ['ai', 'ay', 'a-e'] },
  { id: 'ee', say: '/ee/', ex: 'sheep', graphemes: ['ee', 'ea', 'e-e', 'y-alt'] },
  { id: 'igh', say: '/igh/', ex: 'white', graphemes: ['igh', 'ie', 'i-e'] },
  { id: 'oa', say: '/oa/', ex: 'goat', graphemes: ['oa', 'oe', 'o-e', 'ow-alt'] },
  { id: 'oo', say: '/oo/', ex: 'blue', graphemes: ['oo', 'ue', 'ew', 'u-e'] },
  // **الاستثناءُ المعلَن** (رأسُ الجدول): رسمُه رسمُ أخيه، فنصُّه المنطوق علامتُه الدولية
  { id: 'oo-book', say: '/ʊ/', ex: 'book', graphemes: ['oo-book'] },
  { id: 'ar', say: '/ar/', ex: 'car', graphemes: ['ar'] },
  { id: 'or', say: '/or/', ex: 'for', graphemes: ['or', 'aw', 'au'] },
  { id: 'ur', say: '/ur/', ex: 'girl', graphemes: ['ur', 'ir'] },
  { id: 'er', say: '/er/', ex: 'spider', graphemes: ['er'] },
  { id: 'ow', say: '/ow/', ex: 'cow', graphemes: ['ow', 'ou'] },
  { id: 'oi', say: '/oi/', ex: 'boy', graphemes: ['oi', 'oy'] },
  { id: 'ear', say: '/ear/', ex: 'ear', graphemes: ['ear'] },
  { id: 'air', say: '/air/', ex: 'chair', graphemes: ['air'] },
  { id: 'ure', say: '/ure/', ex: 'sure', graphemes: ['ure'] },
];

/** رسمٌ ← صوتُه (يُبنى مرّةً من الجدول أعلاه — ولا خريطةَ ثانية تُكتب بيد). */
const SOUND_OF_SYMBOL = new Map(
  PHONEMES.flatMap((p) => p.graphemes.map((g) => [g, p.id])));

/** صوتُ رمزٍ بمعرّفه، أو `null` — يقرؤه `check_range` فيمسك رمزاً بلا صوت. */
export const phonemeOf = (symbolId) => SOUND_OF_SYMBOL.get(symbolId) || null;

/** **نصُّ الصوت المنطوق** (`/s/`) — وهو مفتاحُ ملفّه في قائمة الصوت. */
export const phonemeSay = (id) => PHONEMES.find((p) => p.id === id)?.say || '';

/** أصائتٌ هذا الصوت؟ — يُقرأ من `VOWEL_SYMBOLS` لا يُعلَن ثانيةً (مصدرٌ واحد). */
export const isVowelSound = (id) =>
  (PHONEMES.find((p) => p.id === id)?.graphemes || []).some((g) => VOWEL_SYMBOLS.has(g));

/** كلمةُ القراءة ← مقاطعُها (تُبنى مرّةً — وهي الطريقُ الوحيد إلى أصوات الكلمة). */
const GPC_OF_WORD = new Map(GRADES.flatMap((g) => g.words.map((w) => [w.w, w.gpc])));

/** كلمةٌ مصوَّرة ← أصواتُها المعلَنة (توسعةُ الجلسة ٥ — رأسُ `WORDS`). */
const SOUNDS_OF_WORD = new Map(WORDS.filter((w) => w.sounds).map((w) => [w.w, w.sounds]));

/**
 * **أصواتُ كلمةٍ** بمعرّفاتها، أو `null` لكلمةٍ لم يُعلَن لها صوتٌ ولا مقاطع.
 *
 * **ومصدران لا يتزاحمان** (يحرس تفرّقَهما `check_range`):
 *   • **كلمةُ السلّم** تُقرأ أصواتُها من `gpc` — رسمُها هو نفسُه بنيتُها الصوتية.
 *     **ومقاطعُ الرسم مادّةُ صوتٍ هنا لا مادّةَ قراءة**: س٤ سمعيةٌ خالصة ولا يُعرَض
 *     فيها رسمٌ (`METHOD.md §٤`)، فلا يعرف الطفلُ أنّ ثَمَّ رسماً أصلاً. وهي الوصلةُ
 *     التي تجعل «أوّلَ الصوت» دقيقاً: `cat` و`kite` صوتُهما الأولُ واحد وإن اختلف رسمُهما.
 *   • **وكلمةُ الرصيد المصوَّر** تُعلن أصواتَها (`sounds`) — لا رسمَ لها في السلّم
 *     أصلاً (‏`banana` ليست كلمةَ قراءة)، وإنّما تُسمَع وتُصوَّر. وهذا هو الفرقُ الذي
 *     أوجب حقلاً ثانياً: لو كُتبت `sounds` رسوماً لَادّعينا لها مقاطعَ قراءةٍ ليست لها.
 */
export function soundsOf(word) {
  const declared = SOUNDS_OF_WORD.get(String(word));
  if (declared) return declared;
  const gpc = GPC_OF_WORD.get(String(word));
  if (!gpc) return null;
  const sounds = gpc.map(phonemeOf);
  return sounds.some((s) => !s) ? null : sounds;
}

/**
 * **قافيةُ كلمة** (rime): من أوّل صائتٍ فيها إلى آخرها — `cat` ⇒ `at`، و`duck` ⇒ `uk`.
 * **وهي أصواتٌ لا رسوم**، فـ`duck` و`sock` تتقافيان وإن اختلف رسمُ آخرهما.
 */
export function rimeOf(word) {
  const sounds = soundsOf(word);
  if (!sounds) return null;
  const at = sounds.findIndex(isVowelSound);
  return at < 0 ? null : sounds.slice(at).join('');
}

/** الدرجاتُ حتى هذه الدرجة ضمناً — عليها تُبنى الجبهاتُ كلُّها. */
export function gradesUpTo(gradeId) {
  const end = GRADES.findIndex((g) => g.id === gradeId);
  return end < 0 ? [] : GRADES.slice(0, end + 1);
}

/** معرّفاتُ الرموز المفتوحة عند درجةٍ ما (الحقلُ `symbols` من جبهة المحطة). */
export const symbolsUpTo = (gradeId) =>
  gradesUpTo(gradeId).flatMap((g) => g.symbols.map((s) => s.id));

/** الشائكاتُ المفتوحة عند درجةٍ ما — تراكمياً كما في `METHOD.md §٥`. */
export const trickyUpTo = (gradeId) => gradesUpTo(gradeId).flatMap((g) => g.tricky);

/** كلماتُ القراءة المفكوكة عند درجةٍ ما — حوضُ تمارينها (`build` و`decode`). */
export const wordsUpTo = (gradeId) => gradesUpTo(gradeId).flatMap((g) => g.words);

/** رمزٌ بمعرّفه (لعرضه ولوصفه في لوحة الوالد). */
export const symbolById = (id) =>
  GRADES.flatMap((g) => g.symbols).find((s) => s.id === id) || null;

/**
 * ————— **قيدُ الاقتران: البابُ الوحيد إلى كلمات القراءة** (`METHOD.md §٦`) —————
 *
 * «لا يدخل تمرينَ قراءةٍ (decode/build/text) كلمةٌ لم تبلغ **صندوقَ الإتقان** في
 * مفتاحها السمعيّ» — والفخُّ المُغلَق بها: «فكٌّ بلا معنى»، طفلٌ ينطق `sat` ولا يعرفها.
 *
 * **ولِمَ دالّةٌ لا قائمة؟** لأنّ القيدَ إن كان قاعدةً تُذكَر نُسي، وإن كان بنيةً لم
 * يُنسَ. فليس في هذه الوحدة طريقٌ آخرُ إلى كلمات القراءة: `wordsUpTo` حوضُ المنهج
 * (يقرؤه الفاحصُ ليجرد الرموز)، **وهذه** هي التي يبني منها المولّد — وهي **تأبى أن
 * تُستدعى بلا سؤال ليتنر**: مَن لم يمرّر دالّةَ الإتقان لم يحصل على كلمةٍ واحدة، ولا
 * يمرّ ذلك صامتاً بقائمةٍ فارغة بل يُرمى خطأً يُوقف الشاشة عند أوّل تجربة.
 *
 * ويثبت `tools/check_coupling.mjs` الأمرين معاً: أنّ كلَّ كلمةٍ تُعلن مفتاحَها وأنّ
 * المفتاحَ موجودٌ في الرصيد، وأنّ **كلمةً دون `MASTERED_BOX` سمعاً لا تخرج من هنا
 * أبداً** — محاكاةً بحالة ليتنر مصنوعة.
 *
 * @param {string} gradeId درجةُ المحطة (`h05`)
 * @param {(key: string) => boolean} isMastered `progress.isMastered` أو نظيرتُها
 */
export function readableAt(gradeId, isMastered) {
  if (typeof isMastered !== 'function') {
    throw new TypeError('readableAt: قيدُ الاقتران يحتاج دالّةَ الإتقان '
      + '(`progress.isMastered`) — ولا كلمةَ قراءةٍ تخرج بلا سؤال ليتنر');
  }
  return wordsUpTo(gradeId).filter((word) => isMastered(word.listen));
}

/**
 * **الشائكاتُ المفتوحةُ عند درجةٍ ما** — حوضُ ما يُعرَض منها (هدفاً كان أو مشتّتاً).
 * وهي كلُّها معلَنةٌ بميزانيتها (`METHOD.md §١٢-١`)، وما يُسأل عنه منها يمرّ بعدُ
 * من `readableTrickyAt` أدناه.
 */
export const trickyAt = (gradeId) => trickyUpTo(gradeId);

/** مفتاحُ شائكةٍ السمعيّ، أو `null` إن كانت من كلمات الوظيفة المستثناة بعلّتها. */
export const trickyListen = (word) => HEART_WORDS[word]?.listen || null;

/**
 * ————— **قيدُ الاقتران على الشائكات — بابُها الثاني** (`METHOD.md §٦`) —————
 *
 * حكمُ المدير (١٣ أغسطس ٢٠٢٦): الشائكاتُ **درجتان لا استثناءٌ واحد**. فما أعلن
 * مفتاحاً سمعياً (`HEART_WORDS[w].listen` — الضمائرُ ذواتُ المرجع المرئيّ) **يسري
 * عليه القيدُ كسائر الكلمات**: لا يُسأل عنه في `tricky|…|read` حتى يبلغ مفتاحُه
 * صندوقَ الإتقان. وما أعلن `why` (وظيفةٌ صرفة: `the` · `was` · `are`…) يمضي
 * بميزانيته المعدودة **داخل سياقٍ مسموع** — استثناءٌ بعلّةٍ مكتوبة لا بإهمال.
 *
 * **وهي بابٌ يأبى أن يُستدعى بلا سؤال ليتنر** كأختها `readableAt` تماماً: القاعدةُ
 * التي تُذكَر تُنسى، والبنيةُ لا تُنسى.
 *
 * @param {string} gradeId درجةُ المحطة (`h06`)
 * @param {(key: string) => boolean} isMastered `progress.isMastered` أو نظيرتُها
 */
export function readableTrickyAt(gradeId, isMastered) {
  if (typeof isMastered !== 'function') {
    throw new TypeError('readableTrickyAt: قيدُ الاقتران يحتاج دالّةَ الإتقان '
      + '(`progress.isMastered`) — ولا شائكةَ ذاتُ مدخلٍ تُقرأ بلا سؤال ليتنر');
  }
  return trickyUpTo(gradeId).filter((word) => {
    const key = trickyListen(word);
    return !key || isMastered(key);
  });
}

/**
 * ————— **حوضُ قيد الاقتران كما تراه لوحةُ الوالد** (بندُ الجلسة ٨) —————
 *
 * «وقيدُ الاقتران مرئياً: **يقرأ ما أتقن سمعَه** بعدّاده الحي (كم كلمةً أتقن سمعاً،
 * وكم منها صارت مقروءة)». والعدّادُ **يُقرأ من القياس** (`parent.js` — `couplingCount`)،
 * وهذه تعطيه **الحوضَ ومفاتيحَه**: مَن يملك الكلمةَ يعلن مفتاحَها السمعيَّ ومفاتيحَ
 * قراءتها — فلا تخمّن اللوحةُ مفتاحاً ولا تبني اسمَه بيدها.
 *
 * وحوضُه **كلماتُ القراءة وحدَها**: كلماتُ الدرجات (`build` و`decode`) والشائكاتُ
 * **ذواتُ المدخل السمعي** (`tricky|…|read` — يسري عليها القيدُ كسائرها، `METHOD.md §٦`)؛
 * ولا تدخله كلماتُ الوظيفة الصرفة (`the` · `was`…) لأنّها **المستثنى بعلّته المكتوبة**،
 * فلو عُدّت في «ما ينتظر» لَكذب العدّادُ على الوالد بانتظارٍ لا يقع أبداً.
 *
 * **ومفاتيحُ القراءة هي هي التي تُعلنها المحطات** (`gradeSkills` أعلاه): يُبنيان من
 * قاعدةٍ واحدة (`isTouchable || hasScene` للفكّ)، فلا يفترق ما تعدّه اللوحةُ عمّا
 * يقيسه الطفل.
 * @returns {Array<{w: string, grade: string, listen: string, read: string[]}>}
 */
export function coupledWords() {
  const out = new Map();
  for (const grade of GRADES) {
    for (const word of grade.words) {
      if (out.has(word.w)) continue;          // درجتُها أوّلُ درجةٍ تحملها
      out.set(word.w, {
        w: word.w,
        grade: grade.id,
        listen: word.listen,
        read: [`word|${word.w}|build`,
          ...(isTouchable(word.w) || hasScene(word.w) ? [`word|${word.w}|decode`] : [])],
      });
    }
    for (const word of grade.tricky) {
      const listen = trickyListen(word);
      if (!listen || out.has(word)) continue;  // وظيفةٌ صرفة: لا مفتاحَ سمعياً لها
      out.set(word, { w: word, grade: grade.id, listen, read: [`tricky|${word}|read`] });
    }
  }
  return [...out.values()];
}

/**
 * **شائكةٌ موسومةٌ بدرجتها**: مقاطعُ رسمها ولكلٍّ وسمُه —
 * `heart` موضعُ الشوكة · `dot` مقطعٌ رمزُه مفتوحٌ عند هذه الدرجة فيُفكّ · `''` سواهما.
 *
 * **علامةٌ لا نصٌّ شارح** (بندُ الجلسة ٤): الطفلُ قبل-قارئ بلغتين، فلا تُكتب له
 * «هذا الحرفُ شاذّ» — تُرسَم تحت المقطع علامةٌ يتعلّمها في النمذجة.
 */
export function markedTricky(word, gradeId) {
  const shape = HEART_WORDS[word];
  if (!shape) return null;
  const open = new Set(symbolsUpTo(gradeId));
  // **والشوكةُ قد تكون شوكتين** (`was`: ‏`a` تقول /o/ و`s` تقول /z/) — فتُقرأ قائمةً
  // في الحالين، ولا يُدفَن الموضعُ الثاني بسكوتٍ عنه.
  const hearts = new Set([shape.heart].flat());
  return {
    w: word,
    say: shape.say,
    parts: shape.parts.map((g, at) => ({
      g,
      mark: hearts.has(at) ? 'heart' : open.has(g) ? 'dot' : '',
    })),
  };
}

// ————————————————————————————————————————————————————————————————————————
// ٥) مسارا الرحلة ومحطاتُها
// ————————————————————————————————————————————————————————————————————————

/**
 * **مسارا الرحلة** (`METHOD.md §١`) — جبهتان مستقلتان في ليتنر، يربطهما قيدُ
 * الاقتران كلمةً كلمة. وترتيبُهما على الخريطة يفرضه `sections()`.
 */
/**
 * ————— **توازنُ المراجعة اليومية: نسبةٌ في البيانات بسببها** (`METHOD.md §٧`) —————
 *
 * «والمراجعةُ اليومية تسحب من الجبهتين معاً» — واليومَ صارت الجبهتان قائمتين
 * (بندُ الجلسة ٥)، فوجب أن يُكتب **بأيّ ميزانٍ** تُخلَطان في **حوض التنويع**.
 *
 * وثلاثةُ أحكامٍ في هذا الرقم:
 *   ١) **المستحقُّ أولاً بلا فرزٍ ولا حصّة**: صدرُ الجلسة الأضعفُ من الجبهتين
 *      مخلوطاً كما هو (`dueSkills`) — فالنسبةُ **للتنويع** لا للمستحقّ، وإلّا
 *      صارت حصّةٌ تزاحم ضعفَ الطفل حيث هو.
 *   ٢) **والنصفُ بالنصف** لأنّ المرشَّح ب مساران **مقترنان لا متعاقبان**: جبهةٌ
 *      تبتلع التنويعَ تجعل الأخرى تُنسى بين محطتين، وهو عينُ ما وُجدت المراجعةُ له.
 *   ٣) **ولا تُهدَر حصّةٌ لا مادّةَ لها**: طفلٌ لم يفتح مسارَ الحرف بعدُ (قبل 🚪١)
 *      جبهتُه واحدة، فتأخذ حصّتَه كلَّها — الميزانُ قسمةُ ما وُجد لا وعدٌ بما لم يوجد.
 */
export const REVIEW_MIX = [
  { track: 'listen', share: 1 },
  { track: 'letter', share: 1 },
];

export const TRACKS = [
  {
    id: 'listen',
    title: 'مسارُ السمع',
    sub: 'يفهم الإنكليزيةَ المسموعة ويستجيب لها',
    accent: 'var(--accent-listen)',
    stages: ['listen1', 'listen2', 'listen3', 'listen4', 'listen5'],
  },
  {
    id: 'letter',
    title: 'مسارُ الحرف',
    sub: 'يفكّ المكتوبَ بسلّمٍ شبه مفكوك',
    accent: 'var(--accent-letter)',
    stages: ['letter1', 'letter2', 'letter3', 'letter4'],
  },
];

/**
 * ————— **المتكلمُ والمخاطَب: مرجعٌ يُرسَم لا كلمةٌ في الرصيد** (بندُ الجلسة ٨) —————
 *
 * حكمُ قبول الجلسة ٧ (البند ١ — البديل أ): «شكلُ مشهدٍ بمتكلّمٍ ومخاطَب (وضعان
 * يُدرَّسان في النمذجة) يفتح الضمائرَ الأربع النائمة (‏we · me · my · you)».
 *
 * **وهي ليست من الرصيد المصوَّر ولا تدخله**: `WORDS` كلماتٌ **لها صورةٌ صادقة**،
 * ومرجعُ الضمير **موقعٌ في الكلام** لا شيءٌ يُصوَّر — فلو دُسّت فيه لَطولبت بمدخل
 * Starters مصوَّرٍ ليس لها، ولَخلطت جردَ الكلمات بجردِ ما لا يُصوَّر. فصنفٌ ثالث
 * بجدولٍ صغير: اسمُه، ووضعُه المرسوم (`figures.js`)، وعبارتُه للوالد.
 *
 * **ولا يدخل الجدولَ إلا مَن يُرسَم**: `my` تُقاس بمشهد `me` نفسِه (المِلكُ لمتكلّمٍ
 * مرسوم)، فلا وضعَ لها ولا سطرَ هنا — والمقيسُ يُعلَن في الجملة (`measures`).
 */
export const DEIXIS = [
  { w: 'me', pose: 'speaker', ar: 'المتكلم — «انظر إليّ»' },
  { w: 'we', pose: 'speakers', ar: 'المتكلم ومَن معه — «نحن»' },
  { w: 'you', pose: 'listener', ar: 'المخاطَب — «أنت»' },
];

/** مراحلُ مسار السمع الخمس (`METHOD.md §٤`) — ولكلٍّ محطاتُها بحقلها ومفاتيحها.
 *
 *  **وعناوينُها محطاتُ الرحلة** (البند ٥ من أحكام الهوية): رمزُ المرحلة (س١…س٥)
 *  ثم محطتُها، والوصفُ تحته يقول ما يفعله الطفلُ فيها كما كان. */
const LISTEN_STAGES = [
  {
    id: 'listen1', ar: 'س١ — محطةُ الأسماء', sub: 'كلمةٌ تُسمَع وصورةٌ تُلمَس',
    type: 'quiz', face: '👂',
    parts: [
      { part: 's1-1', title: 'الأهل', field: 'family', face: '👨‍👩‍👧‍👦' },
      { part: 's1-2', title: 'الجسد والوجه', field: 'body', face: '👁️' },
      { part: 's1-3', title: 'الحيوانات', field: 'animals', face: '🐈' },
      { part: 's1-4', title: 'الطعام والشراب', field: 'food', face: '🍎' },
      // **والألوانُ نمطُها `swatch`**: تسعٌ مربّعاتُها في يونيكود، وثنتان بقعتان
      // مُصيَّرتان بقيمة لونهما (حكمُ المدير — رأسُ الرصيد المصوَّر أعلاه).
      { part: 's1-5', title: 'الألوان', field: 'colours', face: '🟥', pictures: 'swatch' },
      { part: 's1-6', title: 'الأعداد سمعاً', field: 'numbers', face: '🔵', pictures: 'count' },
    ],
  },
  {
    id: 'listen2', ar: 'س٢ — محطةُ الأوامر', sub: 'أمرٌ يُسمَع وفعلٌ يُنفَّذ',
    type: 'tpr', face: '✋',
    // **والأمرُ المنطوق مادّةُ منهجٍ لا نصُّ شاشة** (`METHOD.md §٣`: «ولا كلمةَ في
    // تمرينٍ خارجه»): `order` قالبُ الأمر بالإنكليزية، و`{w}` موضعُ الكلمة منه.
    // فمن أراد أن يعرف ما يُقال للطفل قرأه هنا، ومنه تُستخرَج نصوصُ قائمة الصوت.
    parts: [
      { part: 's2-1', title: 'المس ما تسمع', field: 'animals', face: '✋', kind: 'tpr-do',
        order: 'point to the {w}', from: ['cat', 'dog', 'fish', 'bird', 'duck', 'frog'] },
      { part: 's2-2', title: 'أين أضعه؟', field: 'places', face: '📦', kind: 'tpr-put',
        pictures: 'scene', props: ['apple', 'box'], order: 'put the apple {w} the box' },
      { part: 's2-3', title: 'افعل مثلي', field: 'verbs', face: '🏃', kind: 'tpr-do',
        pictures: 'act', order: '{w}' },
      { part: 's2-4', title: 'أمرٌ من شيئين', field: 'school', face: '🟩', kind: 'tpr-two',
        pictures: 'scene', props: ['ball'], order: 'point to the {size} {colour} ball',
        from: ['big', 'small'], colours: ['red', 'blue', 'green', 'yellow'] },
    ],
  },
  {
    // **صورةُ الزوج بالبيانات لا باليد** (رأسُ `pairMode` أدناه): الزوجُ مصوَّرٌ حيث
    // **كلتا** كلمتيه في الرصيد المصوَّر بصورةٍ مفردة، وإلّا فتمييزٌ صوتيٌّ خالص —
    // وهو حكمُ f/v المقيَّد في `METHOD.md §٤` **معمَّماً بالبيانات** لا مكتوباً لزوج.
    id: 'listen3', ar: 'س٣ — محطةُ الأصوات المتقاربة', sub: 'زوجان يُسمَعان ويُميَّزان',
    type: 'contrast', face: '🔀',
    parts: [
      { part: 's3-1', title: 'p و b', face: '🍐', pairs: [
        { key: 'p-b', phonemes: ['p', 'b'], words: ['pear', 'bear'] }] },
      { part: 's3-2', title: 'f و v', face: '🔊', pairs: [
        { key: 'f-v', phonemes: ['f', 'v'],
          why: 'بابُ V في Starters ‏2025 فيه كلمةٌ واحدة (very) ولا صورةَ صادقة لها '
            + '— فلا زوجَ أدنى مصوَّرٌ في الرصيد (`METHOD.md §٤` أحكامُ المادة)' }] },
      { part: 's3-3', title: 'الحركاتُ القصار', face: '🐑', pairs: [
        { key: 'i-ee', phonemes: ['i', 'ee'], words: ['ship', 'sheep'] },
        { key: 'i-e', phonemes: ['i', 'e'],
          why: 'bit/bet وأخواتُهما ليست من مداخل Starters ‏2025' },
        { key: 'a-u', phonemes: ['a', 'u'],
          why: 'cap/cup ليستا من مداخل Starters ‏2025 (وفيها `baseball cap` وحدَها)' }] },
      // **والعنقودُ تجاورُ ساكنين لا صوتٌ ثالث**: التمييزُ فيه بين مطلعٍ عنقوديّ
      // ومطلعٍ مفرد (‏spider/sun) — فلا صوتَ معزولاً يُقابَل به، وحاملاه لازمان.
      { part: 's3-4', title: 'العناقيد', face: '🕷️', pairs: [
        { key: 'sp', words: ['spider', 'sun'] },
        { key: 'st', words: ['stop', 'sock'] },
        { key: 'fr', words: ['frog', 'fish'] }] },
    ],
  },
  {
    // **مادّةُ س٤ محسوبةٌ من الأصوات ومن حصيلة الطفل** (`earPool` أدناه): لا قائمةَ
    // مديات تُكتب بيد — فلا مدىً بلا مادّةٍ تكفيه، ولا صورةٌ يُسأل عنها الطفلُ ولم
    // يلقَها بعدُ في محطةٍ سابقة.
    id: 'listen4', ar: 'س٤ — محطةُ الأذن الفونيمية', sub: 'أصواتٌ بلا حرفٍ يُرى',
    type: 'ear', face: '🔊',
    parts: [
      // **ثلاثٌ عتبةُ المادّة**: هدفٌ ومشتّتان في الجولة، فمدىً بأقلَّ من ثلاث كلماتٍ
      // يُعيد الصورةَ نفسَها في كل جولة فيُحفَظ الجوابُ بالشكل لا بالسمع.
      { part: 's4-1', title: 'الصوتُ الأول', face: '🔤', unit: 'phon', kind: 'pick',
        pool: 'met', initials: { min: 3 } },
      // **والدمجُ والتقطيعُ ثلاثةُ أصوات** (عينُ L&S المرحلة ١: CVC شفهياً) — ومادّتُهما
      // واحدة لأنّهما مهارتان متعاكستان على الكلمة نفسِها.
      { part: 's4-2', title: 'اجمعِ الأصوات', face: '🧩', unit: 'oral', kind: 'blend-ear',
        pool: 'met', sounds: { count: 3 } },
      { part: 's4-3', title: 'قطِّع الكلمة', face: '✂️', unit: 'oral', kind: 'segment-ear',
        pool: 'met', sounds: { count: 3 } },
      // **والقافيةُ كلمتان فأكثر**: تُسمَع واحدةٌ وتُلمَس أختُها، فاثنتان تكفيان مدىً.
      { part: 's4-4', title: 'القافية', face: '🎵', unit: 'rhyme', kind: 'pick',
        pool: 'met', rhymes: { min: 2 } },
    ],
  },
  {
    id: 'listen5', ar: 'س٥ — محطةُ الزاد', sub: 'بقيةُ الحقول، وجملُ «الآن وهنا»',
    type: 'quiz', face: '🧺',
    parts: [
      { part: 's5-1', title: 'الملابس', field: 'clothes', face: '👕' },
      { part: 's5-2', title: 'المدرسة واللعب', field: 'school', face: '📚' },
      { part: 's5-3', title: 'البيت أغراضاً', field: 'home', face: '🛏️' },
      { part: 's5-4', title: 'الأماكن والطبيعة', field: 'places', face: '🌳' },
      { part: 's5-5', title: 'أفعالُ اليوم', field: 'verbs', face: '🍽️' },
      // ————— **جملُ «الآن وهنا»: صورةٌ تُطابَق جملةً مسموعة** (`METHOD.md §٤`) —————
      //
      // ثلاثُ مجموعاتٍ (`group`)، **والمشتّتاتُ من مجموعة الجملة وحدَها** — فلا يفترق
      // الخياران في شيئين فيُجاب بالمصادفة: مشهدُ الموضع يفارق أخاه بموضعٍ أو بشيء،
      // ومشهدُ «مَن؟» لا يفارق أخاه إلا **بالضمير نفسِه**.
      //
      // **والمقيسُ ما يفرّق بين الخيارات** (وبه صار للثمانِ ذواتِ المدخل بيتٌ —
      // حكمُ قبول الجلسة ٥ البند ١): جملةٌ خياراتُها ثلاثةُ مشاهدَ تختلف كلَّها
      // مقيسُها **الجملةُ** (`sentence|…|match`)، وجملةٌ خياراتُها لا تختلف إلا في
      // صاحب الفعل أو المِلك مقيسُها **الضميرُ** (`word|he|listen-pick` — بشكل مفاتيح
      // الرصيد نفسِه، فيستيقظ `readableTrickyAt` من تلقائه).
      //
      // **وأربعةٌ من الثمانِ لا مشهدَ صادقَ لها اليوم** (`we` · `me` · `my` · `you`):
      // مرجعُها **المتكلمُ والمخاطَب** لا شخصٌ في الصورة، فلا تُميَّز بصورةٍ إلا برسم
      // متكلّمٍ ومخاطَبٍ في المشهد — وهو شكلٌ جديد لم تقرّره الجلسةُ ذاتياً (بندٌ
      // يُرفَع)، فتبقى مفاتيحُها معلنةً وبابُها نائماً كما كان.
      { part: 's5-6', title: 'جملُ الآن وهنا', field: 'sentences', face: '🖼️',
        pictures: 'scene',
        // أصحابُ المشهد في مجموعتَي «مَن؟» و«لِمَن؟» — منهم تُشتقّ المشتّتات
        owners: ['boy', 'girl', 'family'],
        sentences: [
          { id: 'cat-on-bed', text: 'the cat is on the bed', group: 'place',
            scene: { thing: 'cat', zone: 'on', holder: 'bed' }, uses: ['cat', 'on', 'bed'] },
          { id: 'dog-under-chair', text: 'the dog is under the chair', group: 'place',
            scene: { thing: 'dog', zone: 'under', holder: 'chair' },
            uses: ['dog', 'under', 'chair'] },
          { id: 'bird-in-box', text: 'the bird is in the box', group: 'place',
            scene: { thing: 'bird', zone: 'in', holder: 'box' }, uses: ['bird', 'in', 'box'] },
          { id: 'fish-in-water', text: 'the fish is in the water', group: 'place',
            scene: { thing: 'fish', zone: 'in', holder: 'water' },
            uses: ['fish', 'in', 'water'] },
          { id: 'ball-under-bed', text: 'the ball is under the bed', group: 'place',
            scene: { thing: 'ball', zone: 'under', holder: 'bed' },
            uses: ['ball', 'under', 'bed'] },
          // مجموعةُ «مَن؟» — الإطارُ واحد والفارقُ الضمير
          { id: 'he-happy', text: 'he is happy', group: 'who', measures: 'he',
            scene: { one: 'boy' }, uses: ['boy'] },
          { id: 'she-happy', text: 'she is happy', group: 'who', measures: 'she',
            scene: { one: 'girl' }, uses: ['girl'] },
          { id: 'they-happy', text: 'they are happy', group: 'who', measures: 'they',
            scene: { one: 'family' }, uses: ['family'] },
          // مجموعةُ «لِمَن؟» — الشيءُ واحد والفارقُ صاحبُه
          { id: 'her-hat', text: 'her hat is big', group: 'own', measures: 'her',
            scene: { own: 'girl', thing: 'hat' }, uses: ['girl', 'hat'] },
          { id: 'their-ball', text: 'their ball is red', group: 'own', measures: 'their',
            scene: { own: 'family', thing: 'ball' }, uses: ['family', 'ball'] },
        ] },
      // ————— **س٥-٧: مَن يتكلّم ومَن يُخاطَب** (بندُ الجلسة ٨ — البديل أ) —————
      //
      // **وهي أختُ س٥-٦ لا شكلٌ ثالث**: الإطارُ إطارُها (جملةٌ تُسمَع ومشهدٌ يُلمَس،
      // والمشتّتُ من مجموعتها، والمقيسُ ما يفرّق بين الخيارات) — والمبدَّلُ **أصحابُ
      // المشهد**: يدخلهم المتكلمُ والمخاطَب مرسومَين (`DEIXIS`). فما جديدُها إلا
      // مرجعٌ يُرسَم، وبه تُقاس الأربعُ النائمة بمفاتيح الرصيد نفسِها فيستيقظ
      // `readableTrickyAt` من تلقائه (‏we · me · my · you شائكاتُ ح٧–ح٩).
      //
      // **وموضعُها من الخريطة محسوبٌ لا مكتوب** (`firstGradeNeeding`): مفاتيحُها
      // مفاتيحُ شائكات ح٧، فتقع قبلها — كما وقعت س٥-٦ قبل ح٦ بـ`he` و`she`.
      //
      // **والمِلكُ يُقاس بالمتكلم نفسِه**: «my hat is big» مشهدُها `me` وقبعتُه،
      // ومشتّتاتُها أصحابٌ آخرون بالقبعة نفسِها — فالفارقُ **صاحبُ المِلك** وحدَه،
      // وهو عينُ ما يفرّق `my` عن `her` (وأختُها «her hat is big» في س٥-٦ قبلها).
      { part: 's5-7', title: 'أنا وأنت', field: 'sentences', face: '🙋',
        pictures: 'scene',
        owners: ['me', 'we', 'you', 'boy', 'girl', 'family'],
        sentences: [
          { id: 'look-at-me', text: 'look at me', group: 'who', measures: 'me',
            scene: { one: 'me' }, uses: [] },
          { id: 'we-happy', text: 'we are happy', group: 'who', measures: 'we',
            scene: { one: 'we' }, uses: [] },
          { id: 'you-happy', text: 'you are happy', group: 'who', measures: 'you',
            scene: { one: 'you' }, uses: [] },
          { id: 'my-hat', text: 'my hat is big', group: 'own', measures: 'my',
            scene: { own: 'me', thing: 'hat' }, uses: ['hat'] },
        ] },
    ],
  },
];

/** كلماتُ محطةٍ من الرصيد المصوَّر (`WORDS`) — بحقلها ومحطتها لا بقائمةٍ ثانية. */
const wordsAt = (part) => WORDS.filter((word) => word.at === part);

/**
 * **وحدةُ الكلمة**: الأفعالُ `verb` وما سواها `word` — والحقلُ `verbs` هو الفارق،
 * فلا يُخمَّن من صيغة الكلمة.
 */
const unitOfWord = (word) => (word.field === 'verbs' ? 'verb' : 'word');

/**
 * كلمةٌ من الرصيد المصوَّر باسمها، أو `undefined`.
 * **وبفهرسٍ يُبنى مرّة** لا بمسحٍ في كل نداء: تُنادى مئاتِ المرّات في تأليف الرحلة،
 * وبطءُ الخريطة على آيبادٍ قديم درسٌ مدفوعُ الثمن (`main.js` — الطيُّ الكسول).
 */
const WORD_INDEX = new Map(WORDS.map((word) => [word.w, word]));
const wordNamed = (name) => WORD_INDEX.get(name);

/**
 * **شكلٌ باسمه في مشهد**: كلمةٌ من الرصيد المصوَّر، أو **مرجعٌ ضميريٌّ مرسوم**
 * (`DEIXIS`) — أو `undefined`. وبها وحدَها تعرف الشاشةُ ما ترسم لاسمٍ في مشهد،
 * فلا يُخترَع شكلٌ لاسمٍ لم يُعلَن (`figureEl` يردّ صورةً فارغة لمن لا إعلانَ له).
 */
const DEIXIS_INDEX = new Map(DEIXIS.map((one) => [one.w, one]));
export const figureNamed = (name) => WORD_INDEX.get(name) || DEIXIS_INDEX.get(name);

/**
 * **أمصوَّرٌ هذا الزوج؟ — حكمٌ بالبيانات لا بيد** (`METHOD.md §٤`: «بالصور **حيث**
 * للزوجين معنى مصوَّر»، وحكمُ المدير في f/v: «تمييزٌ صوتيٌّ خالص»).
 *
 * فالزوجُ مصوَّرٌ حيث **كلتا** كلمتيه في الرصيد المصوَّر **بصورةٍ مفردة تُلمَس**
 * (`face`)، وإلّا فتمييزٌ صوتيٌّ خالص. ولم يُكتب `mode` لزوجٍ بعينه: يومَ تدخل
 * كلمةٌ الرصيدَ (أو تخرج منه) ينتقل زوجُها من شكلٍ إلى شكل بلا سطرٍ يُعدَّل.
 */
export const pairMode = (pair) =>
  ((pair.words || []).length === 2 && pair.words.every((w) => wordNamed(w)?.face)
    ? 'word' : 'sound');

/** ترتيبُ محطات السمع مسطَّحاً — عليه يقوم «ما لقيَه الطفلُ قبل هذه المحطة». */
const listenParts = () => LISTEN_STAGES.flatMap((stage) => stage.parts);

/**
 * **حوضُ س٤: ما لقيَه الطفلُ قبل هذه المحطة، ممّا نعرف أصواتَه.**
 *
 * شرطان معاً، ولكلٍّ علّتُه:
 *   • **مصوَّرةٌ بوجهٍ ولها أصواتٌ معلَنة** — الجوابُ صورةٌ تُلمَس، وحكمُ «أوّلِ الصوت»
 *     والقافيةِ يحتاج أصواتَ الكلمة (`soundsOf`).
 *   • **لقيَها في محطةٍ سابقة** — سؤالُ «أيُّ الصور تبدأ بـ/s/؟» يفترض أنّ الطفلَ
 *     **يسمّي** ما يرى؛ فصورةُ كلمةٍ لم يلقَها بعدُ تجعل السؤالَ حزراً لا سمعاً.
 *     (وهو أشدُّ من قاعدة «المدخل المفهوم» عند س٢-٤: تلك كلمةٌ **تُسمَع** ولا تُقاس،
 *     وهذه صورةٌ **يُطلَب تسميتُها** ليُحكَم على صوتها.)
 */
const EAR_POOLS = new Map();

function earPool(partId) {
  // **ويُحسَب مرّةً**: الحوضُ يقرأ كلَّ محطةٍ قبله (ومنها محطاتُ س٤ نفسُها)، فحسابُه
  // في كل نداءٍ يضرب كلفةَ تأليف الرحلة — وبياناتُ المنهج لا تتحرّك وقتَ التشغيل.
  if (EAR_POOLS.has(partId)) return EAR_POOLS.get(partId);
  const parts = listenParts();
  const at = parts.findIndex((p) => p.part === partId);
  const met = new Map();
  for (const part of parts.slice(0, Math.max(at, 0))) {
    for (const word of listenWords(part)) {
      if (word.face && soundsOf(word.w)) met.set(word.w, word);
    }
  }
  const pool = [...met.values()];
  EAR_POOLS.set(partId, pool);
  return pool;
}

/** حوضُ محطةٍ مصنَّفاً بمفتاحٍ صوتيّ — أساسُ مديات س٤-١ وس٤-٤. */
function soundGroups(part, keyOf) {
  const groups = new Map();
  for (const word of earPool(part.part)) {
    const key = keyOf(word.w);
    if (key) groups.set(key, [...(groups.get(key) || []), word]);
  }
  return groups;
}

/** مدياتُ «الصوتِ الأول»: أصواتٌ لها من حوض المحطة ما يكفي (`initials.min`). */
const initialRanges = (part) =>
  [...soundGroups(part, (w) => soundsOf(w)?.[0])]
    .filter(([, words]) => words.length >= part.initials.min)
    .map(([sound]) => `initial-${sound}`).sort();

/** مدياتُ القافية: قوافٍ لها من حوض المحطة كلمتان فأكثر (`rhymes.min`). */
const rhymeRanges = (part) =>
  [...soundGroups(part, rimeOf)]
    .filter(([, words]) => words.length >= part.rhymes.min)
    .map(([rime]) => rime).sort();

/**
 * **موادُّ محطةٍ سمعية**: كلماتُها من الرصيد المصوَّر — إمّا كلماتُ محطتها كلُّها
 * (`WORDS[].at`)، وإمّا قائمةٌ معلَنة (`from`) تستعير ممّا سبق (س٢ تأمر بكلمات س١)،
 * وإمّا حوضٌ **محسوب** ممّا لقيَه الطفل (س٤ — `earPool`).
 */
function listenWords(part) {
  const byName = (list) => list.map(wordNamed).filter(Boolean);
  // زوجُ التمييز: حاملاه كلمتان مصوَّرتان — والزوجُ الصوتيّ الخالص بلا حاملَين
  // (`pairMode` أعلاه: الحكمُ بالبيانات).
  if (part.pairs) {
    return byName(part.pairs.filter((p) => pairMode(p) === 'word')
      .flatMap((p) => p.words || []));
  }
  // **وأصحابُ المشهد مادّةُ محطةٍ كما جملُها**: منهم تُشتقّ مشتّتاتُ «مَن؟» و«لِمَن؟»
  if (part.sentences) {
    return byName([...part.sentences.flatMap((s) => s.uses), ...(part.owners || [])]);
  }
  const named = [...(part.from || []), ...(part.colours || [])];
  if (named.length) return byName(named);
  if (part.pool === 'met') {
    const pool = earPool(part.part);
    return part.sounds
      ? pool.filter((w) => soundsOf(w.w).length === part.sounds.count)
      : pool;
  }
  return wordsAt(part.part);
}

/**
 * **أصواتُ محطةٍ المنطوقةُ معزولةً** — نصوصٌ من `PHONEMES` لا كلماتٌ من الرصيد، فلا
 * يجردها حارسُ الكلمات بل حارسُ الأصوات (`check_range` — بابُ أصوات المنهج).
 */
function listenSounds(part) {
  const says = (ids) => [...new Set(ids)].map(phonemeSay).filter(Boolean);
  if (part.pairs) {
    return says(part.pairs.filter((p) => pairMode(p) === 'sound')
      .flatMap((p) => p.phonemes || []));
  }
  if (part.initials) return says(initialRanges(part).map((r) => r.slice('initial-'.length)));
  // الدمجُ والتقطيعُ ينطقان أصواتَ كلماتهما واحداً واحداً
  if (part.sounds) return says(listenWords(part).flatMap((w) => soundsOf(w.w)));
  return [];
}

/**
 * **أدواتُ المشهد** — كلماتٌ **تُعرَض ولا تُقاس**: التفاحةُ والصندوق في «ضع التفاحةَ
 * في الصندوق»، والكرةُ في «المس الكرة الحمراء الكبيرة». المقيسُ في تلك المحطات
 * **حرفُ الجرّ والصفةُ** لا اسمُ الشيء، فلو دخلت الأدواتُ `words` لَصار لها مفتاحُ
 * ليتنر تُسأل عنه ولم تُدرَّس قطّ.
 *
 * **وهي مُعلَنةٌ لا مُهرَّبة**: تدخل جبهةَ محطتها بحقلها (أدناه) ويجردها
 * `check_range` كما يجرد كلماتِ التمرين — فما يراه الطفلُ محسوبٌ كلُّه، مقيساً كان
 * أو مادّةَ مشهد.
 */
const listenProps = (part) =>
  (part.props || []).map((w) => WORDS.find((x) => x.w === w)).filter(Boolean);

/** مفاتيحُ محطةٍ سمعية — تُشتقّ من موادّها، فلا مفتاحَ يُكتب مرّتين. */
function listenSkills(part) {
  // **ومفتاحُ الجملة من مقيسها**: ما لا يفرّق خياراتِه إلا الضميرُ يُقاس ضميراً
  // بمفتاح الرصيد نفسِه (`word|he|listen-pick`)، وما سواه يُقاس جملةً (`METHOD.md §٧`).
  if (part.sentences) {
    return part.sentences.map((s) => (s.measures
      ? `word|${s.measures}|listen-pick`
      : `sentence|${s.id}|match`));
  }
  if (part.pairs) return part.pairs.map((p) => `pair|${p.key}|pick`);
  if (part.initials) return initialRanges(part).map((r) => `${part.unit}|${r}|${part.kind}`);
  if (part.rhymes) return rhymeRanges(part).map((r) => `${part.unit}|${r}|${part.kind}`);
  const kind = part.kind || 'listen-pick';
  // و**الوحدةُ تُعلَن حين تفارق حقلَها**: س٤-٢ وس٤-٣ تسمعان كلماتِ س١ نفسَها ولكنّ
  // المقيسَ فيهما **الدمجُ والتقطيع** لا معرفةُ الكلمة (`oral|cat|blend-ear`، §٧).
  return listenWords(part).map((word) => `${part.unit || unitOfWord(word)}|${word.w}|${kind}`);
}

/**
 * جبهةُ محطةٍ سمعية: **حقولُها المفتوحة تُقرأ من موادّها لا تُكتب بيد** — فمحطةٌ
 * تستعير من حقلٍ لم تُعلنه تُمسَك، ولا يمرّ حقلٌ في الجبهة بلا كلمةٍ منه. ولا رمزَ
 * ولا شائكةَ في مسار السمع: مسارُ الحرف لم يُفتَح بعدُ (ق٤).
 */
const listenFrontier = (part) => ({
  fields: [...new Set([
    ...(part.field ? [part.field] : []),
    ...listenWords(part).map((word) => word.field),
    ...listenProps(part).map((word) => word.field),
    ...(part.sentences ? ['sentences'] : []),
  ])],
  symbols: [],
  tricky: [],
});

/** محطاتُ مسار السمع الأربعُ والعشرون — محسوبةٌ من `LISTEN_STAGES`. */
function listenStations() {
  return LISTEN_STAGES.flatMap((stage) => stage.parts.map((part) => ({
    id: `${stage.type}:${part.part}`,
    type: stage.type,
    part: part.part,
    track: 'listen',
    stage: stage.id,
    title: part.title,
    face: part.face,
    pictures: part.pictures || 'face',
    words: listenWords(part),
    props: listenProps(part),
    // نوعُ تمرينها ووحدةُ قياسها وقالبُ أمرها المنطوق وألوانُه — كما أعلنتها المحطة
    // (تقرؤها شاشتُها، فلا تعرف شاشةٌ محطةً بمعرّفها بل بما تُعلنه). **والوحدةُ تلزم
    // حيث يشترك النوع**: س٤-١ وس٤-٤ كلتاهما `pick`، وتفترقان بوحدتيهما (`phon` ·
    // `rhyme`) — فبها تعرف الشاشةُ أيَّ سؤالٍ تبني.
    kind: part.kind || 'listen-pick',
    unit: part.unit || '',
    order: part.order || '',
    colours: (part.colours || []).map(wordNamed).filter(Boolean),
    // **والزوجُ يخرج محكوماً لا خاماً**: شكلُه (`mode`) محسوبٌ، وحاملاه كلمتان من
    // الرصيد، ونصّا صوتيه منطوقان — فلا تعيد شاشتُه الحسابَ ولا تخالفه.
    pairs: (part.pairs || []).map((pair) => ({
      key: pair.key,
      mode: pairMode(pair),
      // **والمُعلَنُ يخرج مع المحسوب**: `names` أسماءُ الحاملَين كما أُعلنا، و`words`
      // ما وُجد منهما في الرصيد المصوَّر — فيقابل الحارسُ الشكلَ المحسوب بقاعدته،
      // ويمسك حاملاً أُعلن ولم يبلغ الرصيد (وإلّا سقط صامتاً وانقلب الشكل).
      names: [...(pair.words || [])],
      words: (pair.words || []).map(wordNamed).filter(Boolean),
      sounds: (pair.phonemes || []).map(phonemeSay),
      why: pair.why || '',
    })),
    // مدياتُ المحطة كما تُقاس (الحقلُ الثاني من مفتاحها) — تقرؤها شاشتُها
    ranges: listenSkills(part).map((key) => key.split('|')[1]),
    // ما تنطقه معزولاً من أصوات المنهج
    sounds: listenSounds(part),
    sentences: part.sentences || [],
    // **وأصحابُ المشهد صنفان**: كلماتٌ مصوَّرة (‏boy · girl · family) **ومراجعُ
    // ضميريةٌ مرسومة** (المتكلمُ والمخاطَب — س٥-٧)، فتُقرأ بـ`figureNamed` لا
    // بـ`wordNamed` وإلّا سقط المرجعُ صامتاً وانقلب السؤالُ بلا مشتّت.
    owners: (part.owners || []).map(figureNamed).filter(Boolean),
    frontier: listenFrontier(part),
    skills: listenSkills(part),
  })));
}

/**
 * **نوعُ شاشة الدرجة**: `grade` لدرجةٍ تُدرِّس رموزاً، و`cluster` لدرجة العناقيد.
 * ويُقرأ من **إعلان الدرجة** (`clusters`) لا من خلوّ رموزها — فالخلوُّ قرينةٌ
 * تصدُق اليوم، والإعلانُ حكمٌ يبقى.
 */
const gradeType = (grade) => (grade.clusters ? 'cluster' : 'grade');

/**
 * **أللكلمة صورةٌ مفردةٌ تُلمَس؟** — شرطُ شكل `decode` نفسِه: «كلمةٌ مكتوبة تُفكّ
 * **فتُلمَس صورتُها**» (بندُ الجلسة ٤). وهو **حكمٌ بالبيانات لا بيد**، بقاعدة `specOf`
 * عينِها في `figures.js`: وجهٌ أو كمّيةٌ أو بقعةُ لونٍ أو وضعٌ مرسوم.
 *
 * **وخمسُ كلماتٍ خارجه بعلّةٍ واحدة**: `in` و`on` و`under` و`big` و`small` مادّتُها
 * **مشهدٌ** (`pictured: 'scene'`) — لا صورةَ مفردةَ لها تُلمَس، فمعناها إنّما يُرى في
 * مشهد س٢ (تفاحةٌ **في** الصندوق · الكرةُ **الكبيرة**). **ولها اليومَ بابُها**:
 * `hasScene` أدناه وشكلُ «فكٍّ في مشهد» (حكمُ قبول الجلسة ٤ البند ١: «مُقَرّ مبدأً
 * ويُجدوَل بنداً في الجلسة ٦ — وقراءةُ حرف الجرّ بلمس موضعه أصدقُ فكٍّ لها»).
 *
 * **والفرقُ بين البابين لازم**: هذه تجيب «أللكلمة صورةٌ مفردة؟» — وبها تُنتقى
 * **مشتّتاتُ** الفكّ، فلو دخلتها كلمةُ مشهدٍ لَرُسمت بطاقةٌ فارغة (`specOf` لا صورةَ
 * لها).
 */
export const isTouchable = (word) => {
  const entry = WORD_INDEX.get(word);
  return Boolean(entry
    && (entry.face || entry.count || entry.swatch || entry.pictured === 'act'));
};

/** أللكلمة **مشهدٌ** يُرى فيه مصداقُها؟ (`pictured: 'scene'` — موضعٌ أو حجم). */
export const hasScene = (word) => WORD_INDEX.get(word)?.pictured === 'scene';

/**
 * **مشهدُ كلمةٍ تُفكّ** — أدواتُه **من محطتها السمعية نفسِها** (`props`)، فما يراه
 * الطفلُ يومَ يفكّ `in` هو المشهدُ الذي تعلّم فيه معناها (تفاحةٌ وصندوق) لا مشهدٌ
 * يُخترَع له. و`null` لكلمةٍ لا مشهدَ لها.
 *
 * **وأيُّ مشهدٍ يُرسَم بيانُ رسمٍ لا بيانُ منهج** (نظيرُ `ZONES` في `tpr.js`): هذه
 * تقول «من أين أدواتُه»، والشاشةُ تقول «كيف يُرسَم» — ومَن لا تعرف الشاشةُ رسمَ
 * مشهده لا يُولَّد له تمرين، ويمسك مفتاحَه العاطلَ بابُ «لكلِّ مفتاحٍ مادّة».
 */
export function sceneOf(word) {
  const entry = WORD_INDEX.get(word);
  if (!entry || entry.pictured !== 'scene') return null;
  const home = stations().find((s) => s.part === entry.at);
  return { at: entry.at, props: home?.props || [] };
}

/**
 * ————— **رسمٌ واحد أولاً ثم بدائلُه** (`METHOD.md §١٢-٦` — قاعدة Jolly) —————
 *
 * **الرمزُ السابقُ الذي يقول صوتَ هذا الرمز** — أو `null` إن كان هو أوّلَ رسمٍ لصوته.
 * فـ`ay` (ح١٤) صوتُها `/ai/` ورسمُها الأولُ `ai` (ح٩)، و`a-e` (ح١٥) كذلك — **والأولُ
 * هو المرجع**: يُعرَض معلوماً ويُعلَّم البديلُ عليه («هذا الصوتُ تعرفه — وهذا رسمٌ
 * آخرُ يقوله»).
 *
 * **وبه يُحسَم لبسٌ في السؤال لا في التدريس وحدَه**: «اسمع الصوتَ والمس رسمَه» عند
 * ح١٤ سؤالٌ **جوابُه رسمان** (‏/ai/ يكتبها `ai` و`ay` وكلاهما مفتوح)، فيتعلّم الطفلُ
 * بالاستبعاد أنّ رسمَ /ai/ هو `ay` وهو كذبٌ عليه. فيُستبدَل بالشكل `alt-pick`: يُعرَض
 * المرجعُ ويُسمَع صوتُه، ويُسأل عن **الرسم الآخر** الذي يقوله — جوابٌ واحد لا غير.
 *
 * والترتيبُ مقروءٌ من السلّم نفسِه (أوّلُ درجةٍ يظهر فيها رسمٌ لهذا الصوت)، فلا جدولَ
 * ثانٍ يُكتب بيد ولا يفترق يومَ تتحرّك درجةُ رمزٍ.
 */
export function priorGrapheme(symbolId) {
  const sound = phonemeOf(symbolId);
  if (!sound) return null;
  for (const grade of GRADES) {
    for (const symbol of grade.symbols) {
      if (symbol.id === symbolId) return null;
      // **والنطقُ البديل ليس رسماً مرجعاً**: رسمُه رسمُ أخيه (`ow-alt` هي `ow`)،
      // فلو اتُّخذ مرجعاً لَعُرض للطفل رسمان متطابقان في سؤالٍ واحد.
      if (!symbol.alt && phonemeOf(symbol.id) === sound) return symbol.id;
    }
  }
  return null;
}

/**
 * **الرمزُ الذي يشاركه رسمَه ونطقُه الأول** (ح١٦) — أو `null`: `ow-alt` رسمُها `ow`
 * ونطقُها الأولُ `/ow/` عند ح١١. وهو **المقابلُ في السؤال**: نطقان لرسمٍ واحد، وأحدُهما
 * صوابٌ ههنا — فلا يُسأل عن النطق البديل إلا ومعه النطقُ المعلوم، وإلّا فأيُّ صوتٍ
 * اختير كان «صحيحاً» في مكانٍ ما من اللغة.
 */
export function sameGrapheme(symbolId) {
  const symbol = GRADES.flatMap((g) => g.symbols).find((s) => s.id === symbolId);
  if (!symbol) return null;
  return GRADES.flatMap((g) => g.symbols)
    .find((s) => s.g === symbol.g && s.id !== symbolId && !s.alt)?.id || null;
}

/** مفاتيحُ درجةٍ: رموزُها صوتاً↔رسماً · كلماتُها دمجاً وفكّاً · شائكاتُها. */
function gradeSkills(grade) {
  const keys = [];
  for (const symbol of grade.symbols) {
    // **ونطوقُ ح١٦ البديلة تُقاس بالرسم لا بالصوت**: السؤالُ فيها «هذا الرسمُ ما
    // صوتُه ههنا؟» — ولا معنى لسؤال «اسمع الصوتَ واختر رسمَه» ورسمُه هو الرسمُ نفسُه.
    // **والرسمُ البديل يُقاس على مرجعه** (`alt-pick` — قاعدة Jolly أعلاه).
    if (!symbol.alt) {
      keys.push(`gpc|${symbol.id}|${priorGrapheme(symbol.id) ? 'alt-pick' : 'sound-pick'}`);
    }
    keys.push(`gpc|${symbol.id}|letter-pick`);
  }
  for (const word of grade.words) keys.push(`word|${word.w}|build`);
  // **والفكُّ مصداقُه صورةٌ مفردة أو مشهد** (بندُ الجلسة ٦ · حكمُ قبول الجلسة ٤):
  // فكلمةُ الموضع والحجم تدخل الفكَّ بمفتاحها، ويُلمَس مصداقُها في مشهدٍ مرسوم.
  for (const word of grade.words) {
    if (isTouchable(word.w) || hasScene(word.w)) keys.push(`word|${word.w}|decode`);
  }
  for (const word of grade.tricky) keys.push(`tricky|${word}|read`);
  for (const pair of grade.vowelPairs || []) keys.push(`vowel|${pair}|mid-pick`);
  return keys;
}

/** محطاتُ مسار الحرف الستَّ عشرة — كلُّ درجةٍ محطةٌ واحدة (`METHOD.md §٥`). */
function gradeStations() {
  return GRADES.map((grade) => ({
    id: `${gradeType(grade)}:${grade.id}`,
    type: gradeType(grade),
    part: grade.id,
    track: 'letter',
    stage: grade.era,
    title: `${grade.ar} — ${grade.symbols.map((s) => s.g).join(' ') || 'العناقيد'}`,
    face: '🔠',
    // **ومحطاتُ الحرف نصٌّ لا صور**: المعروضُ فيها الرسمُ نفسُه يُفكّ، فلا يُطالَب
    // كلماتُها بصورةٍ — وصورتُها إنّما تُطلب في محطتها السمعية (قيدُ الاقتران).
    pictures: 'text',
    words: grade.words,
    pool: wordsUpTo(grade.id),
    frontier: {
      fields: [],
      symbols: symbolsUpTo(grade.id),
      tricky: trickyUpTo(grade.id),
    },
    skills: gradeSkills(grade),
  }));
}

/**
 * **أوّلُ درجةٍ تُكتب لها قصة** (`METHOD.md §٥`): «من بعد 🚪٢، كتابٌ لكل درجةٍ
 * فصاعداً» — فالبوابةُ الثانية بعد ح٥، ولا قصةَ قبل ح٦ (يحرسه `check_range`).
 */
export const STORY_FROM = 'h06';

/**
 * **القصةُ محطةٌ لِما كُتب نصُّه لا لِما وُعد به** (تصحيحُ الجلسة ٦).
 *
 * كانت المحطاتُ تُنشأ للدرجات كلِّها بنصٍّ `null` تكتبه الجلستان ٦ و٧ — **وذلك ثقبٌ
 * في القفل التسلسليّ**: عقدةٌ بلا شاشةٍ لا تُكتب لها نجمة، والجبهةُ تقف عندها فلا
 * يُفتَح بعدها شيءٌ ما حيي الجهاز (وهو عينُ العيب الذي وُلد منه `test_nodes.mjs`).
 * فصارت القصةُ تدخل الرحلةَ **يومَ يُكتب نصُّها**، والجلسةُ ٧ تُدخل بقيّتَها بكتابتها
 * لا بسطرٍ يُعدَّل هنا.
 */
function storyStations() {
  return GRADES.filter((grade) => STORIES[grade.id]).map((grade) => {
    const story = STORIES[grade.id];
    return {
      id: `story:${grade.id}`,
      type: 'story',
      part: grade.id,
      track: 'letter',
      stage: grade.era,
      title: `قصةُ ${grade.ar} — ${story.title}`,
      face: '📖',
      pictures: 'text',
      words: [],
      pages: story.pages,
      // **ونصُّها مسرودٌ في حقلٍ واحد** يجرده `check_range` كلمةً كلمة (بابُ القصة)
      text: story.pages.map((page) => page.text).join(' '),
      frontier: {
        fields: [],
        symbols: symbolsUpTo(grade.id),
        tricky: trickyUpTo(grade.id),
      },
      skills: [`text|${grade.id}|read`],
    };
  });
}

/**
 * **مسارُ الحرف: كلُّ درجةٍ ثم قصّتُها** — «كتابٌ لكل درجةٍ فصاعداً» (`METHOD.md §٥`)
 * في موضعه من الرحلة: يقرأ الطفلُ قصةَ الدرجة بعد درجتها لا بعد العهد كلِّه.
 * (وهو ما تركه بندُ الجلسة ٤ المرفوع الثاني لهذه الجلسة بحكم المدير: «قصةُ كل درجةٍ
 * شأنُ بندَي ٦/٧» — وموضعُ شطر العهد يتبدّل معه آلياً بلا سطرٍ يُعدَّل.)
 */
function letterStations() {
  const stories = new Map(storyStations().map((station) => [station.part, station]));
  return gradeStations().flatMap((station) =>
    [station, ...(stories.has(station.part) ? [stories.get(station.part)] : [])]);
}

/**
 * **محطاتُ الرحلة** (`METHOD.md §٤–§٥`) — محسوبةٌ من الجداول أعلاه، لا مكتوبةٌ يدَاً.
 * ويقرؤها `test_measure.mjs` ليقابل ما يعلنه المنهجُ بما تكتبه الشاشات، ويجردها
 * `check_range.py` جبهةً جبهة.
 */
export function stations() {
  return [...listenStations(), ...letterStations()];
}

const stationsAt = (stageId) => stations().filter((s) => s.stage === stageId);

// ————————————————————————————————————————————————————————————————————————
// ٦) البوابات الثلاث
// ————————————————————————————————————————————————————————————————————————

/** مفاتيحُ مراحلَ بعينها — مدَى البوابة (`gateSkills`). */
const skillsOfStages = (...stageIds) =>
  stations().filter((s) => stageIds.includes(s.stage)).flatMap((s) => s.skills);

/**
 * **البوابات الثلاث** (`METHOD.md §٤–§٥`) — و`after` معرّفُ القسم الذي تليه.
 * وأولاها **بابُ منهجٍ لا تشجيع**: اجتيازُها شرطُ فتح مسار الحرف (ق٤).
 */
export const GATES = [
  {
    id: 'ear', after: 'listen4', title: 'عبورُ الأذن', face: '👂',
    hint: 'أذنُك صارت تعرف الإنكليزية — بالعبور تنال أوّلَ ختمٍ في جوازك، وبعدها نفتح بابَ الحروف',
    again: 'أُذنُك تكبر مع كل سماع — نسمع مرّةً أخرى ثم نعبر',
    opens: 'letter',
    scope: skillsOfStages('listen1', 'listen2', 'listen3', 'listen4'),
  },
  {
    id: 'decode', after: 'letter1', title: 'عبورُ الفكّ', face: '🔤',
    hint: 'صرتَ تفكّ الكلمة بنفسك — صرتَ قارئاً أولَ، وفي جوازك ختمٌ ثانٍ',
    again: 'الحروفُ تحتاج تكراراً — نفكّ بعضَها ثانيةً ثم نعبر',
    scope: skillsOfStages('letter1'),
  },
  {
    id: 'end', after: 'letter4', title: 'ختامُ التأسيس', face: '🎓',
    hint: 'أذنُك تفهم وعينُك تفكّ — تمّ التأسيس، والختمُ الأخير في جوازك',
    again: 'بقيت خطوة: نشدّ ما تزعزع من السمع والحرف معاً ثم نختم',
    // **وبابُ «المستوى الثاني» يُذكَر ذكراً لا وعداً يُقاس** (`METHOD.md §١٣`: «وما
    // بعدُ … أفقٌ لا التزام»): جملةٌ في احتفال الختام تقول إنّ بعد التأسيس بابًا،
    // ولا عقدةَ لها في الخريطة ولا مفتاحَ في ليتنر — فلا يُوعَد طفلٌ بما ليس عندنا.
    next: 'وبعدَ التأسيس بابٌ آخر — المستوى الثاني',
    scope: skillsOfStages('listen1', 'listen2', 'listen3', 'listen4', 'listen5',
      'letter1', 'letter2', 'letter3', 'letter4'),
  },
];

// ————————————————————————————————————————————————————————————————————————
// ٧) أقسامُ الرحلة بالترتيب — الوصلةُ الوحيدة بين المنهج والواجهة
// ————————————————————————————————————————————————————————————————————————
//
// **وترتيبُها عقدُ الرحلة**: القفلُ تسلسليّ (`progress.js`)، فما وُضع أولاً فُتح أولاً.
//
// ————— **موضعُ س٥: تداخلٌ محسوب لا كتلةٌ تُقدَّم** (حكمُ المدير، `METHOD.md §٤`) —————
//
// وضعت الجلسةُ ١ كتلةَ س٥ الستَّ **بعد 🚪١ وقبل ح١** لتمنع وقوفَ مسار الحرف عند أوّل
// كلمةٍ من حقولها (قيدُ الاقتران)، فحكم المدير (١٣ أغسطس ٢٠٢٦): العلّةُ وجيهةٌ
// **ونصفُ الحلّ** — إذ يؤخّر ذلك أوّلَ حرفٍ ستَّ محطات فينقض توازيَ المرشَّح ب. ونصُّ
// الحكم: «الخريطةُ خطٌّ واحد (مبدأ العائلة الأول)، فالتوازي يُترجَم **تداخلاً
// بالبيانات**: كلُّ محطةِ س٥ تُوضَع قبل أولِ درجةِ حرفٍ تحتاج كلماتِ حقولها مباشرةً،
// **ولا تتقدم كتلةُ س٥ كلُّها على ح١**».
//
// **والموضعُ محسوبٌ من البيانات لا مكتوبٌ بيد**: لكلِّ كلمةِ قراءةٍ **مفتاحُها السمعيّ
// مكتوباً** (`GRADES[].words[].listen` — عقدُ الجلسة ١)، فأوّلُ درجةٍ تحمل كلمةً
// مفتاحُها من محطة س٥ هي التي تسبقها تلك المحطة. فإن تحرّكت كلمةٌ في السلّم غداً تحرّك
// موضعُ المحطة معها، ولا سطرَ يُعدَّل هنا. (وما لا تحتاجه درجةٌ — جملُ س٥-٦ — يلحق
// بآخر موضعِ تداخل، فلا يُترك إلى ذيل الرحلة بلا علّة.)
//
// **وهذا هو التوازي مترجَماً**: أوّلُ ثلاث درجاتٍ من الحرف تسبق أوّلَ محطةِ توسعة،
// ثم يتناوب المساران بحسب حاجة الكلمة نفسِها — والتوازي التامّ يقع حيث نصَّ عليه
// المنهج: في **المراجعة اليومية** التي تسحب من الجبهتين معاً (`METHOD.md §٧`).

const nodeOf = (station) => ({
  id: station.id,
  type: station.type,
  part: station.part,
  title: station.title,
  face: station.face,
});

const gateNode = (gate) => ({
  id: `gate:${gate.id}`,
  type: 'gate',
  part: gate.id,
  title: gate.title,
  face: gate.face,
});

const gateSection = (gateId) => {
  const gate = GATES.find((g) => g.id === gateId);
  return {
    kind: 'gate', id: `gate-${gate.id}`, title: gate.title, sub: gate.hint,
    face: gate.face, accent: 'var(--accent-gate)', nodes: [gateNode(gate)],
  };
};

const stageSection = (stage) => ({
  kind: 'stage', id: stage.id, title: stage.ar, sub: stage.sub, face: stage.face,
  accent: 'var(--accent-listen)',
  nodes: stationsAt(stage.id).map(nodeOf),
});

/**
 * قسمُ عهدٍ — أو **جزءٌ منه** حين تتخلّله محطةُ توسعةٍ سمعية أو حين يطول.
 *
 * **والجزءُ الأخير يحمل معرّفَ العهد** (`letter1`) وما قبله مرقَّم (`letter1-1`):
 * لأنّ البوابةَ تُعلن موضعَها بـ`after: 'letter1'` — وهي إنّما تلي **تمامَ** العهد
 * لا أوّلَ أجزائه. فلو حمل الأولُ الاسمَ لَوقعت 🚪٢ في وسط العهد الذي تختمه.
 */
const eraSection = (era, stations, index, count, sub) => ({
  kind: 'era',
  id: index === count - 1 ? era.id : `${era.id}-${index + 1}`,
  title: era.ar.split(' — ')[0],
  sub: index === 0 ? era.ar.split(' — ')[1] : sub,
  face: '🔠', accent: 'var(--accent-letter)',
  nodes: stations.map(nodeOf),
});

/**
 * **سقفُ عقد القسم الواحد** — قرارُ المالك (`FAMILY §١٠ب`): **سقفٌ لا هدف**، لا قسمَ
 * في الخريطة فوق اثنتي عشرةَ عقدة. وعلّتُه في يد الطفل: درجٌ يُفرَد فيملأ الشاشةَ
 * بما لا يُحاط به نظراً. ويحرسه `check_range.py` (بابُ حدّ المجموعة) مُجرَّباً سالباً.
 */
export const SECTION_CAP = 12;

/**
 * شطرُ قائمةٍ إلى أجزاءٍ **متساوية** لا إلى «سقفٍ وبقية»: أربعَ عشرةَ محطةً تصير
 * سبعاً وسبعاً لا اثنتي عشرةَ واثنتين — فلا يبقى في الخريطة ذيلٌ لا يُفهَم لِمَ هو.
 */
function evenChunks(list, cap) {
  const parts = Math.max(1, Math.ceil(list.length / cap));
  const size = Math.ceil(list.length / parts);
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** **المرحلةُ المتداخلة** — نصُّ `METHOD.md §٤`: س٥ وحدَها تُواصل موازيةً لمسار الحرف. */
const INTERLEAVED = 'listen5';

/** قسمُ توسعةٍ سمعية متداخل — محطةٌ أو أكثرُ يجمعها موضعُ تداخلٍ واحد. */
const listen5Section = (stations) => {
  const stage = LISTEN_STAGES.find((s) => s.id === INTERLEAVED);
  return {
    kind: 'stage', id: `${stage.id}-${stations[0].part}`, title: stage.ar,
    sub: stations.map((s) => s.title).join(' · '),
    face: stage.face, accent: 'var(--accent-listen)',
    nodes: stations.map(nodeOf),
  };
};

/**
 * **أوّلُ درجةِ حرفٍ تحتاج كلماتِ هذه المحطة مباشرةً** — أو `null` إن لم تحتجها درجة.
 *
 * تُقرأ من **المفتاح السمعيّ المكتوب** في كل كلمة قراءة (`words[].listen`)، وهو عينُ
 * ما يفرضه قيدُ الاقتران — فموضعُ المحطة على الخريطة والقيدُ الذي يحكمها **مصدرُهما
 * واحد**، ولا يفترقان يومَ تنتقل كلمةٌ من درجةٍ إلى درجة.
 */
function firstGradeNeeding(station) {
  const keys = new Set(station.skills);
  // **والشائكةُ ذاتُ المدخل تحتاج محطتَها كما تحتاجها كلمةُ القراءة** (`METHOD.md §٦`
  // — حكمُ الدرجتين): `he` شائكةُ ح٦ ومفتاحُها السمعيّ في س٥-٦، فلو تأخّرت محطتُها
  // عن ح٦ لَبلغ الطفلُ درجةً شائكاتُها كلُّها محبوسةٌ عنه. والقاعدةُ واحدة والمصدرُ
  // واحد: أوّلُ درجةٍ تحتاج **مادّةَ هذه المحطة** هي التي تسبقها تلك المحطة.
  return GRADES.find((g) => g.words.some((w) => keys.has(w.listen))
    || g.tricky.some((word) => keys.has(HEART_WORDS[word]?.listen)))?.id || null;
}

/**
 * مواضعُ التداخل: `درجةٌ ← محطاتُ س٥ التي تسبقها`.
 * **وما لا تحتاجه درجة** (جملُ س٥-٦ — لا تدخل كلمةُ قراءةٍ حقلَها) يلحق **بآخر موضع**
 * لا بذيل الرحلة: مادّتُه جملٌ من حقولٍ فُتحت كلُّها قبله، فتأخيرُه بلا علّةٍ تأخير.
 */
function listen5Slots() {
  const slots = new Map();
  const loose = [];
  for (const station of listenStations().filter((s) => s.stage === INTERLEAVED)) {
    const at = firstGradeNeeding(station);
    if (at) slots.set(at, [...(slots.get(at) || []), station]);
    else loose.push(station);
  }
  const order = GRADES.map((g) => g.id);
  const last = [...slots.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b)).pop();
  if (loose.length && last) slots.set(last, [...slots.get(last), ...loose]);
  return { slots, loose: last ? [] : loose };
}

/** أقسامُ مسار الحرف ومعها محطاتُ س٥ في مواضعها المحسوبة. */
function letterSections() {
  const { slots, loose } = listen5Slots();
  const used = new Set();
  const out = [];
  for (const era of ERAS) {
    const groups = [[]];
    const inserts = new Map();      // موضعُ المجموعة ← محطاتُ س٥ التي تسبقها
    for (const station of stationsAt(era.id)) {
      // **والقصةُ لا تفتح موضعاً**: هي ودرجتُها جزءٌ واحد (`part` نفسُه)، والتداخلُ
      // يقع قبل **الدرجة** التي تحتاج الكلمات لا قبل قصّتها.
      const before = station.type === 'story' || used.has(station.part)
        ? null : slots.get(station.part);
      if (before?.length) {
        used.add(station.part);
        if (groups.at(-1).length) groups.push([]);
        inserts.set(groups.length - 1, before);
      }
      groups.at(-1).push(station);
    }
    /* **ثم يُشطَر الطويلُ بالسقف** (`SECTION_CAP`): والشطرُ بعد التداخل لا قبله، فما
       شطره التداخلُ قد لا يبلغ السقفَ أصلاً — ولكلِّ جزءٍ **سببُ نشأته مكتوباً** في
       سطره، فلا يقرأ الوالدُ «تتمةً بعد محطة سمع» وليس قبلها محطةُ سمع. */
    const parts = groups.flatMap((stations, index) => [
      ...(inserts.has(index) ? [{ listen5: inserts.get(index) }] : []),
      ...evenChunks(stations, SECTION_CAP).map((chunk, at) => ({
        stations: chunk,
        sub: at === 0 ? 'تتمةُ العهد — بعد محطةِ السمع التي تفتح كلماتِها'
          : 'تتمةُ العهد — جزءٌ ثانٍ كي لا يطول القسمُ على عينِ الطفل',
      })),
    ]);
    const eras = parts.filter((part) => part.stations).length;
    let at = 0;
    for (const part of parts) {
      if (part.listen5) {
        out.push(listen5Section(part.listen5));
        continue;
      }
      out.push(eraSection(era, part.stations, at, eras, part.sub));
      at++;
    }
  }
  // **ولا محطةَ تسقط من الخريطة**: موضعٌ لم يُصادَف (درجةٌ حُذفت) أو ذيلٌ بلا مواضعَ
  // أصلاً يلحق بآخر الرحلة — ويمسكه `check_range` («محطةٌ في المنهج لا تصل») إن ضاع.
  const orphans = [...slots].filter(([at]) => !used.has(at)).flatMap(([, list]) => list);
  if (orphans.length || loose.length) out.push(listen5Section([...orphans, ...loose]));
  return out;
}

/**
 * **أقسامُ الرحلة بالترتيب** — تُؤلَّف تأليفاً من المراحل والعهود والبوابات،
 * فلا عقدةَ تُكتب بيد ولا عددَ يُحصى.
 *
 * **والبوابةُ تلي قسمَها بإعلانها** (`GATES[].after`) لا بسطرٍ يُكتب هنا: فلو انقسم
 * عهدٌ أجزاءً بتداخل س٥ بقيت البوابةُ في موضعها من تمامه.
 */
export function sections() {
  const out = [];
  const emit = (section) => {
    out.push(section);
    const gate = GATES.find((g) => g.after === section.id);
    if (gate) out.push(gateSection(gate.id));
  };
  for (const stage of LISTEN_STAGES) {
    if (stage.id !== INTERLEAVED) emit(stageSection(stage));
  }
  for (const section of letterSections()) emit(section);
  return out;
}

/**
 * **ما تنتظره محطةٌ لتكتمل مادّتُها** — مفاتيحُ السمع التي يقف عليها قيدُ الاقتران
 * في هذه المحطة (كلماتُ قراءتها وشائكاتُها ذواتُ المدخل).
 *
 * **وعلّتُه في مجرى الأيام لا في اللحظة** (أمسكها حارسُ الوعد، الجلسة ٧): القصةُ
 * نصٌّ **كلُّه أو لا شيء**، فتقف عندها الجبهةُ حتى تنضج كلماتُها سمعاً — وجلسةُ
 * المراجعة تسير بـ«الأضعف أولاً» فقد لا تمرّ على الكلمة التي تفتح البابَ أسابيع.
 * فتُقدَّم مفاتيحُ **العقدة القائمة على الجبهة** في صدر الجلسة: لا تُخترَق ليتنر
 * (المفتاحُ لا يُسأل عنه إلا مستحقّاً أو بِكراً، ولا يرتفع صندوقُه أكثرَ من مرّةٍ في
 * اليوم)، وإنما يُصرَف **دورُ السؤال** إلى ما يفتح للطفل بابَه.
 */
export function pendingListenOf(stationId) {
  const station = stations().find((s) => s.id === stationId);
  if (!station) return [];
  if (station.type === 'story') {
    const words = new Set(String(station.text || '').split(/\s+/));
    return [...new Set(GRADES.flatMap((g) => g.words)
      .filter((word) => words.has(word.w)).map((word) => word.listen)
      .concat([...words].map((word) => HEART_WORDS[word]?.listen)))].filter(Boolean);
  }
  if (station.type !== 'grade' && station.type !== 'cluster') return [];
  return [...new Set([
    ...(station.words || []).map((word) => word.listen),
    ...(station.frontier.tricky || []).map((word) => HEART_WORDS[word]?.listen),
  ])].filter(Boolean);
}

/** البوابةُ التي تقف قبل هذا الموضع، أو `null` — بيانٌ مُعلَن لا شرطٌ مضمر. */
export function gateBefore(where) {
  return GATES.find((gate) => gate.after === where) || null;
}

/** بوابةٌ بمعرّفها (تستعملها شاشةُ البوابة في `gate.js`). */
export function gateById(id) {
  return GATES.find((gate) => gate.id === id) || null;
}

/**
 * **مدى البوابة**: مفاتيحُ المهارات التي تسأل عنها هذه البوابة من أضعف ما في يد
 * الطفل (`METHOD.md §٤`: «من **أضعف** مهارات س١–س٤»). ولولا المدى لَتصدّر جلسةَ
 * بوابةِ الفكّ ضعفٌ في السمع، فمرّ الطفل إلى القراءة وفكُّه متزعزع — وهي عينُ
 * العلّة التي وُجدت البوابةُ لها.
 */
export function gateSkills(id) {
  return gateById(id)?.scope || [];
}

// ————— لوحة الوالد: **بالمهارة لا بالدرجة** (`METHOD.md §٧` و§٨ والجلسة ٨) —————
//
// اللوحةُ تُترجم ولا تخترع: أسماءُ الوحدات وعباراتُها **بياناتُ منهجٍ هنا** (مَن كتب
// مفتاحَ ليتنر يسمّيه)، والمدى يُقرأ من سجلّ ليتنر الحيّ — فلا رقمَ في اللوحة مكتوبٌ
// بيد ولا عبارةَ تُقال بلا سجلٍّ يسندها.

/** **أقسامُ اللوحة** — قسمان جوهريان: السمعُ والحرف (`SESSIONS.md §٨`). */
export const UNIT_SECTIONS = [
  { id: 'listen', title: 'ما يسمعه ويفهمه' },
  { id: 'letter', title: 'ما يفكّه ويقرؤه' },
];

/**
 * **جدولُ الوحدات** — الحقلُ الأول من مفتاح ليتنر (`METHOD.md §٧`).
 *
 * وزيادةٌ واحدة على أمثلة §٧: **`sentence`** لجمل س٥-٦ («The cat is on the bed»)،
 * ولم تُجعَل `text` لأنّ `text` وحدةُ **القصص** في مسار الحرف — ووحدةٌ واحدة لا
 * تسكن قسمين في لوحة الوالد، فتصير عبارتُها كاذبةً على أحدهما. (بندٌ يُرفَع.)
 */
export const UNIT_UNITS = [
  { id: 'word', section: 'listen', title: 'كلماتٌ يعرفها سمعاً',
    does: 'يعرف {ما} سمعاً', needs: 'يحتاج تثبيتَ {ما}',
    count: ['كلمةً واحدة', 'كلمتين', 'كلمات', 'كلمة'] },
  { id: 'verb', section: 'listen', title: 'أفعالٌ يفهمها وينفّذها',
    does: 'ينفّذ {ما} حين يسمعها', needs: 'يحتاج تثبيتَ {ما}',
    count: ['فعلاً واحداً', 'فعلين', 'أفعال', 'فعلاً'] },
  { id: 'pair', section: 'listen', title: 'أصواتٌ متقاربة يميّزها',
    does: 'يميّز {ما} سمعاً', needs: 'يخلط {ما}',
    count: ['زوجاً واحداً', 'زوجين', 'أزواج', 'زوجاً'] },
  { id: 'phon', section: 'listen', title: 'أولُ الصوت في الكلمة',
    does: 'يعرف أوّلَ الصوت في {ما}', needs: 'يحتاج تمييزَ أوّل الصوت في {ما}',
    count: ['صوتاً واحداً', 'صوتين', 'أصوات', 'صوتاً'] },
  { id: 'oral', section: 'listen', title: 'دمجُ الأصوات وتقطيعُها سمعاً',
    does: 'يدمج ويقطّع {ما} سمعاً', needs: 'يحتاج تدريباً على {ما}',
    count: ['كلمةً واحدة', 'كلمتين', 'كلمات', 'كلمة'] },
  { id: 'rhyme', section: 'listen', title: 'القافية',
    does: 'يسمع قافيةَ {ما}', needs: 'يحتاج سماعَ قافية {ما}',
    count: ['قافيةً واحدة', 'قافيتين', 'قوافٍ', 'قافية'] },
  { id: 'sentence', section: 'listen', title: 'جملٌ يفهمها مصوَّرة',
    does: 'يفهم {ما} مسموعةً', needs: 'يحتاج تكرارَ {ما}',
    count: ['جملةً واحدة', 'جملتين', 'جمل', 'جملة'] },
  { id: 'gpc', section: 'letter', title: 'رموزٌ يعرف أصواتها',
    does: 'يعرف صوتَ {ما} ورسمَه', needs: 'يحتاج تثبيتَ {ما}',
    count: ['رمزاً واحداً', 'رمزين', 'رموز', 'رمزاً'] },
  { id: 'vowel', section: 'letter', title: 'الصائتُ الأوسط',
    does: 'يسمع الصائتَ الأوسط في {ما}', needs: 'يخلط {ما}',
    count: ['زوجاً واحداً', 'زوجين', 'أزواج', 'زوجاً'] },
  { id: 'tricky', section: 'letter', title: 'كلماتٌ شائكة',
    does: 'يقرأ {ما}', needs: 'يحتاج تكرارَ {ما}',
    count: ['كلمةً واحدة', 'كلمتين', 'كلمات', 'كلمة'] },
  { id: 'text', section: 'letter', title: 'قصصٌ يقرؤها',
    does: 'يقرأ {ما}', needs: 'يحتاج إعادةَ {ما}',
    count: ['قصةً واحدة', 'قصتين', 'قصص', 'قصة'] },
];

/**
 * **وصفُ وحدةِ قياسٍ** — الشكل: `{ section, title, does, needs }`.
 * والمجهولُ يُردّ `null` فلا يُعرَض للوالد مفتاحٌ خام (عقدُ `parent.js`).
 */
export function unitOf(unit) {
  return UNIT_UNITS.find((u) => u.id === unit) || null;
}

/** عباراتُ مدَياتٍ لا تُقرأ خاماً — مكتوبةٌ بأسبابها لا مشتقّةٌ بحيلة. */
const RANGE_WORDS = {
  'p-b': 'p و b', 'f-v': 'f و v', 'i-ee': 'ship و sheep',
  'i-e': 'الحركة القصيرة i و e', 'a-u': 'الحركة القصيرة a و u',
  sp: 'عنقود sp', st: 'عنقود st', fr: 'عنقود fr',
  'a-i': 'الصائت a و i', 'e-o': 'الصائت e و o', 'i-u': 'الصائت i و u',
};

/**
 * **المدى بعبارة الوالد**: يترجم الحقلَ الثاني من المفتاح (`cat` · `p-b` · `h05` …)
 * إلى ما يقرؤه بالغٌ عربيّ. **والمجهولُ يُردّ كما هو لا يُخفى**.
 *
 * **والوحدةُ تُمرَّر لأنّ المدى وحدَه يلتبس**: مدَى القافية أصواتٌ (`ee`) قد يوافق
 * **رسمَ** رمزٍ في السلّم (`gpc|ee|sound-pick`) — فيقرأ الوالدُ سطرين متطابقين
 * لمهارتين مختلفتين. (وكان جدولُ العبارات يحسم ذلك بيد فيغلب القافيةَ على الرمز.)
 */
export function rangeText(range, unit = '') {
  const text = String(range ?? '');
  if (!text) return '';
  if (unit === 'rhyme') return `قافية ‎-${text}`;
  if (RANGE_WORDS[text]) return RANGE_WORDS[text];
  if (text.startsWith('initial-')) {
    const sound = text.slice('initial-'.length);
    return `أوّلُ صوت ${phonemeSay(sound) || sound}`;
  }
  const grade = GRADES.find((g) => g.id === text);
  if (grade) return `الدرجة ${grade.ar.slice(1)}`;
  // **والرسمُ وحدَه لا يكفي حين يشترك فيه رمزان**: `oo` في boot غيرُها في look،
  // و`ow` في cow غيرُها في yellow — فلو عُرضتا للوالد باسمٍ واحد لقرأ سطرين
  // متطابقين لمهارتين مختلفتين، فظنّ أحدهما تكراراً. فالمثالُ يميّزهما.
  const symbol = symbolById(text);
  if (symbol) {
    const shared = GRADES.flatMap((g) => g.symbols).filter((s) => s.g === symbol.g);
    return shared.length > 1 ? `${symbol.g} (كما في ${symbol.ex})` : symbol.g;
  }
  const sentence = LISTEN_STAGES.flatMap((s) => s.parts)
    .flatMap((p) => p.sentences || []).find((s) => s.id === text);
  if (sentence) return `«${sentence.text}»`;
  return text;
}

/**
 * ————— **حقولُ السمع بمفاتيحها** (بندُ الجلسة ٨: «قسمُ السمع **بالحقول والمهارات**») —————
 *
 * **العلّة**: سطرُ الوحدة يعدّ ما أتقن كلمةً كلمة، ومسارُ السمع خمسُ مئةِ مدخل — فيصير
 * السطرُ جدارَ كلماتٍ لاتينية لا يقرؤه والد. **والوالدُ لا يسأل «أيَّ كلمةٍ يعرف؟» بل
 * «ماذا صار يفهم؟»** — والجوابُ **حقلٌ حقل** (الحيواناتُ · الطعامُ · الألوان…) كما
 * رتّبها المنهجُ بترتيب الأثر.
 *
 * وهي **مبنيّةٌ من مفاتيح مسار السمع نفسِها لا من قائمةٍ ثانية**: فحقلٌ لا محطةَ له
 * لا يظهر، وكلمةٌ تنتقل حقلاً تنتقل معها بلا سطرٍ يُعدَّل.
 *
 * **والوحدةُ فيها كلمةٌ لا مفتاح**: الكلمةُ الواحدة تُسأل في محطاتٍ عدّة (تُلمَس صورتُها
 * · يُنفَّذ أمرُها · تُدمَج أصواتُها)، فعدُّ المفاتيح يقول للوالد «٣٩ في الحيوانات»
 * وحيواناتُ الرصيد أقلُّ من ذلك — رقمٌ لا يعرفه. فتُجمَع مفاتيحُ الكلمة تحت اسمها،
 * **وتُعَدّ متقنةً إذا أتقن كلَّ ما سُئل عنه فيها** (لا بعضَه).
 * @returns {Array<{id: string, title: string, words: Array<{w: string, keys: string[]}>}>}
 */
export function listenFields() {
  const byField = new Map();
  for (const station of listenStations()) {
    for (const key of station.skills || []) {
      const name = key.split('|')[1];
      const word = WORD_INDEX.get(name);
      if (!word?.field) continue;
      const words = byField.get(word.field) || new Map();
      words.set(name, [...new Set([...(words.get(name) || []), key])]);
      byField.set(word.field, words);
    }
  }
  return FIELDS.filter((field) => byField.has(field.id)).map((field) => ({
    id: field.id,
    title: field.ar,
    words: [...byField.get(field.id)].map(([w, keys]) => ({ w, keys })),
  }));
}

/**
 * **ترتيبُ الوحدات كما لقيها الطفل** لا كما تُرتَّب حروفُها — تقرؤه اللوحة فتعرض
 * الوحداتِ بترتيب الرحلة داخلَ كل قسم.
 */
export function journeyUnits() {
  return [...new Set(stations().flatMap((s) => (s.skills || []).map((k) => k.split('|')[0])))];
}
