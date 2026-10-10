/**
 * Security & Email Verification Utilities
 * Blocks disposable/temporary email domains and enforces strong credentials
 */

// Comprehensive blacklist of known disposable and temporary email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temp mail providers
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  '10minutemail.net', 'guerrillamail.com', 'guerrillamail.biz', 'guerrillamail.org',
  'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'sharklasers.com',
  'throwawaymail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'fakeinbox.com',
  'dispostable.com', 'getairmail.com', 'mohmal.com', 'burnermail.io',
  'crazymailing.com', 'inboxkitten.com', 'tempail.com', 'dropmail.me',
  'generator.email', 'emailondeck.com', 'mytemp.email', 'nada.ltd',
  'getnada.com', 'abacusmail.net', 'givmail.com', 'fakemailgenerator.com',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'tinitemp.com', 'tmpmail.org', 'tmpmail.net', 'mytempemail.com',
  'binkmail.com', 'bobmail.info', 'chacuo.net', 'devnullmail.com',
  'dodgeit.com', 'drdrb.net', 'emailmiser.com', 'filzmail.com',
  'harakirimail.com', 'incognitomail.org', 'kasmail.com', 'maileater.com',
  'mailforspam.com', 'mailhazard.com', 'mailslurp.com', 'mailtemp.net',
  'meltmail.com', 'mintemail.com', 'mytrashmail.com', 'nobulk.com',
  'noclickemail.com', 'no-spam.ws', 'oneoffmail.com', 'pookmail.com',
  'safetymail.info', 'shortmail.net', 'sofort-mail.de', 'spambox.us',
  'spamevader.com', 'spamex.com', 'spamfree24.org', 'spamgourmet.com',
  'spamhole.com', 'spaml.com', 'spammotel.com', 'spamspot.com',
  'tempemail.co', 'tempinbox.com', 'tempthe.net', 'trashymail.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'whyspam.me', 'willhackforfood.biz',
  'yep.it', 'zippymail.info', '0-mail.com', '10minmail.de', '20minutemail.com',
  'anonymbox.com', 'antichef.com', 'antichef.net', 'boun.cr',
  'byom.de', 'cloudtemp.email', 'crazymail.com', 'deadaddress.com',
  'discard.email', 'discardmail.com', 'disposablemail.com',
  'eyepaste.com', 'fastcheetah.com', 'ghostlymail.com', 'inboxalias.com',
  'inboxclean.com', 'instantemailaddress.com', 'maildrop.cc', 'mailpoof.com',
  'mailsac.com', 'mailseal.de', 'mailtothis.com', 'mohmal.im',
  'my10minutemail.com', 'mytempemail.net', 'owlymail.com', 'privatemail.com',
  'quickemail.info', 'receivemail.org', 'recursor.net', 'sogetthis.com',
  'soodonims.com', 'spamherelots.com', 'spaminator.de', 'spamkill.info',
  'spamthis.co.uk', 'tafmail.com', 'tmail.ws', 'trash-mail.at',
  'trashmail.at', 'trashmail.io', 'uroid.com', 'vmani.com',
  'wuzupmail.net', 'zoemail.org', 'zillamail.com', 'temp-mail.io',
  'tempmailo.com', 'internxt.com', 'inboxes.com', 'tempmailgen.com',
  'guerrillamail.info', 'guerrillamail.net', 'grr.la', 'spam4.me'
]);

// Patterns matching disposable keywords in domain name
const DISPOSABLE_PATTERNS = [
  /temp.*mail/i,
  /mail.*temp/i,
  /dispos(able)?/i,
  /throwaway/i,
  /fake.*(mail|inbox)/i,
  /trash.*mail/i,
  /10.*min.*mail/i,
  /20.*min.*mail/i,
  /burner.*(mail|inbox)/i,
  /anonym.*(mail|box)/i,
  /spam.*(box|hole|wall|free|kill)/i,
  /guerrilla/i,
  /yopmail/i,
  /sharklaser/i
];

/**
 * Validates RFC standard email structure
 */
export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean) && clean.length <= 254;
};

/**
 * Checks if an email uses a disposable / temporary email domain
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].trim();

  // 1. Direct match in blacklist
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Check subdomain (e.g. abc.mailinator.com)
  for (const blacklisted of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith('.' + blacklisted)) {
      return true;
    }
  }

  // 3. Heuristic pattern match for newly registered temp-mail domains
  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  return false;
};

/**
 * Validates password strength (min 6 chars, must contain letters and numbers)
 */
export const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};
