import type { TMDBMovie } from '../../types/tmdb';

export const EXCLUDE_KEYWORDS =
  '1228|158718|10244|190370|193026|155477|6111|10014|9799|10013|193855|158546|11158|11159|238541|193025|198385|283145|281298|199214|289295|195669|285672|267122|357518|155301|155535|2943|256466|155691|302868|298666|352503|281741|360081|359980|367629|359981|33841|11792|350503|350708|350360|356759|155139|7344|15197|187522|10053|335048|179178|306202|355344|10178|3182|267340|338679|9194|238374|223035|445|199758|238355|158713|2699|333088|230905|33876|320653|463|244648|350714|161373|162628|163171|162504|158714|156186|340117|341284';

const BAD_WORDS = [
  'sex', 'sexual', 'naked', 'nudity', 'erotic', 'porn', 'masturbation', 'stripper', 'prostitute',
  'orgy', 'kama sutra', 'إباحي', 'جنس', 'عاري', 'شذوذ', 'دعارة', 'عاهرة', 'hentai', 'ecchi', 'yaoi', 'yuri', 'eroge',
  'boobs', 'tits', 'nympho', 'softcore', 'hardcore', 'orgasm', 'penis', 'vagina', 'pussy',
  'erotica', 'steamy', 'escort', 'brothel', 'hooker', 'kink', 'bdsm', 'foursome', 'threesome', 'swinger',
  'swingers', 'cuckold', 'voyeur', 'exhibitionist', 'incest', 'incestuous', 'shota', 'loli', 'tentacle', 'ahegao',
  'doujinshi', 'succubus', 'futanari', 'eroge', 'smut', 'nude', 'tayuan', 'vivamax',
  'milf', 'gilf', 'stepmom', 'stepson', 'stepdaughter', 'stepsister', 'stepbrother',
  'seduction', 'seduce', 'wife-swap', 'wifeswap', 'wife swap', 'gangbang', 'blowjob', 'cumshot',
  'dominatrix', 'sexploitation', 'pornstar', 'camgirl', 'porno', 'adult movie', 'adult film',
  'busty', 'seductive', 'horny', 'sexploitation', 'fetish', 'bondage', 'voyeurism'
];

const BAD_REGEX = new RegExp(`\\b(${BAD_WORDS.join('|')})\\b`, 'i');

export const isSafe = (item: TMDBMovie): boolean => {
  const title = (item.title || item.name || '').toLowerCase();
  const overview = (item.overview || '').toLowerCase();
  const originalTitle = (item.original_title || item.original_name || '').toLowerCase();
  const text = `${title} ${overview} ${originalTitle}`;
  return !BAD_REGEX.test(text) && !item.adult;
};
