import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Light content filter. Text people type (support messages, blog comments, reviews, course text) is checked
// against a word list of clearly sexual or vulgar words before it's saved. Suspended accounts can't post.
// Extend WORDS for your audience. Matching ignores case, accents, repeated letters, look-alike digits (p0rn),
// symbols standing in for vowels (p*rn) and dots or spaces between letters (p.o.r.n).

export type TargetType = "support_message" | "blog_comment" | "course_review" | "course" | "profile";

export type Moderation = {
  error?: string;
  hold: boolean;
  record: (targetId: string | null | undefined) => Promise<void>;
};

const WORDS = [
  // English
  "porn", "porno", "pornography", "pornhub", "xvideos", "xhamster", "xnxx", "onlyfans", "nsfw",
  "nudes", "send nudes", "naked pics", "naked pictures", "sexting", "sext", "sexy pics",
  "blowjob", "blow job", "handjob", "hand job", "rimjob", "deepthroat", "cumshot", "creampie", "gangbang", "bukkake",
  "pussy", "pussies", "cunt", "twat", "dickhead", "dick pic", "dick pics", "cocksucker", "cock sucker",
  "boobs", "tits", "titties",
  "fuck", "fucker", "fucking", "fucked", "motherfucker", "fuckboy", "fvck",
  "horny", "orgy", "jerk off", "wank", "wanker",
  "anal sex", "oral sex", "doggy style", "doggystyle",
  "slut", "whore", "escort service", "sugar daddy", "sugar mummy", "sugar mommy",
  "milf", "dildo", "fleshlight", "camgirl", "cam girl", "child porn",
  // Nigerian Pidgin and slang
  "preeq", "preek", "knacking", "knack you", "nack you", "do runs", "runs girl", "runz girl", "olosho", "ashawo", "ashewo",
  // Igbo and Hausa
  "ikpu", "karuwa",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a", "5": "s", $: "s", "7": "t", "8": "b" };
const VOWEL = (v: string) => `[${v}*#%]`;
const SEP = "[\\s._\\-*'\"~|]{0,2}";

function wordPattern(word: string) {
  const parts = [...word].map((ch) => {
    if (ch === " ") return "\\s*";
    const cls = "aeiou".includes(ch) ? VOWEL(ch) : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `${cls}+`;
  });
  return parts.join(SEP);
}

const STRONG = new RegExp(`(?<![a-z])(?:${WORDS.map(wordPattern).join("|")})(?![a-z])`, "i");

function normalize(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[01!34@5$78]/g, (c) => LEET[c] ?? c);
}

// A word-list match, or null.
export function bannedWord(text: string) {
  const m = normalize(text).match(STRONG);
  return m ? m[0] : null;
}

// Suspended accounts can't post. Returns the message to show, or null.
export async function postingBlocked(userId: string) {
  const { data } = await createAdminClient().from("profiles").select("status").eq("id", userId).maybeSingle();
  return data?.status === "suspended" ? "Your account is suspended." : null;
}

const noop = async () => {};

// Checks text before it's saved. Signature kept compatible with callers: (type, userId, fields, link?, options?).
export async function moderate(
  _type: TargetType | string,
  userId: string | null,
  fields: (string | null | undefined)[],
  _link?: string,
  { strike: useStrike = true }: { ai?: boolean; strike?: boolean } = {},
): Promise<Moderation> {
  const ok: Moderation = { hold: false, record: noop };
  if (userId && useStrike) {
    const blocked = await postingBlocked(userId);
    if (blocked) return { ...ok, error: blocked };
  }
  const word = bannedWord(fields.filter(Boolean).join("\n"));
  if (word) return { ...ok, error: `This can't be posted: "${word}" isn't allowed here. Change it and try again.` };
  return ok;
}
