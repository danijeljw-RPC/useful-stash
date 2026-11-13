# Per-user API token and credential management

This guide provides a practical, profile-based secret-management setup for:

- **macOS + Zsh** using the native macOS Keychain.
- **PowerShell 5.1 on Windows** using Windows DPAPI-protected CLIXML files.
- **PowerShell 7.x on Windows** using the same DPAPI approach.
- **PowerShell 7.x on macOS** using the same native macOS Keychain entries as Zsh.

The design is deliberately **per user**, not machine-global:

- On macOS, secrets are stored in the current user's login Keychain and additionally keyed by the current local username.
- On Windows, PowerShell encrypts exported `SecureString` and `PSCredential` values using Windows DPAPI. Microsoft documents that these encrypted values can only be decrypted by the **same user on the same computer**.
- Linux is intentionally not given a fake “secure” fallback. PowerShell `Export-Clixml` does **not** encrypt credentials on non-Windows platforms, so the PowerShell functions in this guide refuse local file storage there.

The same model supports:

- many API tokens for one provider;
- switching the token assigned to a standard environment variable such as `CF_API_TOKEN`;
- one-shot execution where a token only exists for a child command;
- username/password credentials stored under a logical key such as `sql:production`;
- temporary mapping of credentials into environment variables such as `SQLCMDUSER` and `SQLCMDPASSWORD`;
- retrieving a native PowerShell `PSCredential` object when a cmdlet accepts `-Credential` directly.

---

## 1. Naming convention

Use names that describe the provider and purpose rather than numbered tokens.

Recommended token names:

```text
cloudflare:dns
cloudflare:workers
cloudflare:r2
cloudflare:readonly

github:repos
github:packages
github:actions
github:readonly
github:personal

mailersend:production
mailersend:development
```

Recommended credential names:

```text
sql:production
sql:development
windows:service-account
legacy-api:production
```

Avoid names such as:

```text
cloudflare-token-1
github-new
github2
prod-password-final
```

The secret manager should tell you what a credential is for without exposing the secret itself.

---

## 2. macOS + Zsh implementation

### 2.1 Prerequisites

The implementation uses:

- `/usr/bin/security` — built into macOS;
- `curl` — built into macOS;
- `column` — available on macOS;
- `jq` — required for the Cloudflare helper functions.

Install `jq` with Homebrew if required:

```bash
brew install jq
```

Check:

```bash
jq --version
```

---

### 2.2 Remove the old single-token setup

If you previously used the old `cloudflare-dns-api` Keychain entry, remove it after you have created the replacement token/profile you intend to use:

```bash
unset CF_API_TOKEN
unset CLOUDFLARE_API_TOKEN

security delete-generic-password \
  -a "$USER" \
  -s "cloudflare-dns-api" 2>/dev/null
```

Removing an item from Keychain is permanent. `unset` only removes a value from the current shell process.

If the Keychain item does not exist, `security` may return an error. That is harmless in this cleanup case.

---

### 2.3 Complete code for `~/.zshrc`

Paste the complete block below directly into `~/.zshrc`.

```bash
# ============================================================
# Per-user API token and credential manager
# macOS / Zsh
# Version: 3.0
# ============================================================
#
# Secrets are stored in the current user's macOS Keychain.
# Nothing secret is stored directly in ~/.zshrc.
#
# TOKEN NAMING:
#   <provider>:<profile>
#
# Examples:
#   cloudflare:dns
#   cloudflare:workers
#   github:repos
#   mailersend:production
#
# CREDENTIAL NAMING:
#   <system>:<profile>
#
# Examples:
#   sql:production
#   sql:development
#
# Basic token workflow:
#   token_set cloudflare:dns
#   token_use CF_API_TOKEN cloudflare:dns
#   token_status CF_API_TOKEN
#   token_unset CF_API_TOKEN
#
# Cloudflare shortcuts:
#   cf_use dns
#   cf_status
#   cf_verify
#   cf_zones
#   cf_dns example.com
#   cf_dns example.com --full
#
# Credential workflow:
#   credential_set sql:production
#   credential_use sql:production SQLCMDUSER SQLCMDPASSWORD
#   credential_unset SQLCMDUSER SQLCMDPASSWORD
#
# IMPORTANT:
#   Do not echo secrets.
#   Do not put plaintext secrets in ~/.zshrc.
#   Prefer temporary environment variables over command-line
#   password switches such as sqlcmd -P.
# ============================================================


# ============================================================
# Internal state
# ============================================================

# Tracks the logical source of environment variables loaded by
# these helper functions. Values contain profile names only,
# never secrets.
typeset -gA TOKEN_ACTIVE_PROFILE


# ============================================================
# Generic token storage - macOS Keychain
# ============================================================

# Store or replace a token.
#
# Examples:
#   token_set cloudflare:dns
#   token_set github:repos
#
token_set() {
  local service="$1"
  local secret

  if [[ -z "$service" ]]; then
    echo "Usage: token_set <provider:profile>"
    return 1
  fi

  read -s "secret?Token for ${service}: "
  echo

  if [[ -z "$secret" ]]; then
    echo "No token supplied."
    return 1
  fi

  security add-generic-password \
    -U \
    -a "$USER" \
    -s "$service" \
    -w "$secret"

  local result=$?
  unset secret

  if [[ $result -eq 0 ]]; then
    echo "Stored in macOS Keychain: $service"
  else
    echo "Failed to store: $service"
  fi

  return $result
}


# Retrieve a token from Keychain.
#
# WARNING:
#   Calling this directly prints the token to stdout.
#
# Prefer token_use or token_exec for normal operation.
#
token_get() {
  local service="$1"

  if [[ -z "$service" ]]; then
    echo "Usage: token_get <provider:profile>" >&2
    return 1
  fi

  security find-generic-password \
    -a "$USER" \
    -s "$service" \
    -w
}


# Check whether a token exists without displaying it.
token_exists() {
  local service="$1"

  if [[ -z "$service" ]]; then
    echo "Usage: token_exists <provider:profile>"
    return 1
  fi

  if security find-generic-password \
      -a "$USER" \
      -s "$service" \
      >/dev/null 2>&1; then
    echo "$service exists in macOS Keychain."
    return 0
  fi

  echo "$service does not exist in macOS Keychain."
  return 1
}


# Permanently delete a token from Keychain.
token_delete() {
  local service="$1"

  if [[ -z "$service" ]]; then
    echo "Usage: token_delete <provider:profile>"
    return 1
  fi

  security delete-generic-password \
    -a "$USER" \
    -s "$service"
}


# ============================================================
# Token environment-variable management
# ============================================================

# Load a stored token into an environment variable.
#
# Examples:
#   token_use CF_API_TOKEN cloudflare:dns
#   token_use GITHUB_TOKEN github:repos
#   token_use MAILERSEND_API_TOKEN mailersend:production
#
# Reusing the same environment variable replaces its previous
# value and active profile.
token_use() {
  local variable="$1"
  local service="$2"
  local secret

  if [[ -z "$variable" || -z "$service" ]]; then
    echo "Usage: token_use <environment-variable> <provider:profile>"
    return 1
  fi

  secret="$(token_get "$service")" || {
    echo "Unable to load Keychain item: $service"
    return 1
  }

  if [[ -z "$secret" ]]; then
    echo "Keychain item was empty: $service"
    return 1
  fi

  typeset -gx "$variable=$secret"
  TOKEN_ACTIVE_PROFILE[$variable]="$service"

  unset secret

  echo "$variable -> $service"
}


# Remove an environment variable from the current shell.
# This does NOT delete the Keychain item.
token_unset() {
  local variable="$1"

  if [[ -z "$variable" ]]; then
    echo "Usage: token_unset <environment-variable>"
    return 1
  fi

  unset "$variable"
  unset "TOKEN_ACTIVE_PROFILE[$variable]"

  echo "$variable removed from current shell."
}


# Show whether a token environment variable is currently set and,
# when known, which Keychain profile supplied it.
# The token itself is never displayed.
token_status() {
  local variable="$1"
  local profile

  if [[ -z "$variable" ]]; then
    echo "Usage: token_status <environment-variable>"
    return 1
  fi

  if [[ -z "${(P)variable}" ]]; then
    echo "$variable is not set."
    return 1
  fi

  profile="${TOKEN_ACTIVE_PROFILE[$variable]}"

  if [[ -n "$profile" ]]; then
    echo "$variable is set from: $profile"
  else
    echo "$variable is set, but its source profile is unknown."
  fi
}


# Run one command with a token without leaving the token exported
# in the parent shell afterward.
#
# Example:
#   token_exec CF_API_TOKEN cloudflare:dns ./update-dns.sh
#
token_exec() {
  local variable="$1"
  local service="$2"
  local secret

  shift 2

  if [[ -z "$variable" || -z "$service" || $# -eq 0 ]]; then
    echo "Usage: token_exec <environment-variable> <provider:profile> <command...>"
    return 1
  fi

  secret="$(token_get "$service")" || {
    echo "Unable to load Keychain item: $service"
    return 1
  }

  env "$variable=$secret" "$@"
  local result=$?

  unset secret

  return $result
}


# Remove common API environment variables from the current shell.
# Keychain entries remain untouched.
tokens_unload() {
  unset CF_API_TOKEN
  unset CLOUDFLARE_API_TOKEN
  unset GITHUB_TOKEN
  unset GH_TOKEN
  unset MAILERSEND_API_TOKEN
  unset MAILERSEND_API_KEY
  unset OPENAI_API_KEY

  TOKEN_ACTIVE_PROFILE=()

  echo "API credential environment variables removed from current shell."
}


# ============================================================
# Username/password credentials - macOS Keychain
# ============================================================
#
# A logical credential named:
#
#   sql:production
#
# is stored internally as two Keychain entries:
#
#   credential:sql:production:username
#   credential:sql:production:password
#
# Both are keyed to the current macOS user via -a "$USER".
# ============================================================

# Store or replace a username/password credential.
#
# Example:
#   credential_set sql:production
#
credential_set() {
  local name="$1"
  local username
  local password

  if [[ -z "$name" ]]; then
    echo "Usage: credential_set <system:profile>"
    return 1
  fi

  read "username?Username for ${name}: "
  read -s "password?Password for ${name}: "
  echo

  if [[ -z "$username" ]]; then
    echo "Username cannot be empty."
    unset password
    return 1
  fi

  security add-generic-password \
    -U \
    -a "$USER" \
    -s "credential:${name}:username" \
    -w "$username" || {
      unset username password
      return 1
    }

  security add-generic-password \
    -U \
    -a "$USER" \
    -s "credential:${name}:password" \
    -w "$password"

  local result=$?

  unset username password

  if [[ $result -eq 0 ]]; then
    echo "Credential stored in macOS Keychain: $name"
  fi

  return $result
}


# Check whether both parts of a credential exist.
credential_exists() {
  local name="$1"

  if [[ -z "$name" ]]; then
    echo "Usage: credential_exists <system:profile>"
    return 1
  fi

  if security find-generic-password \
      -a "$USER" \
      -s "credential:${name}:username" \
      >/dev/null 2>&1 && \
     security find-generic-password \
      -a "$USER" \
      -s "credential:${name}:password" \
      >/dev/null 2>&1; then
    echo "$name exists in macOS Keychain."
    return 0
  fi

  echo "$name is incomplete or does not exist in macOS Keychain."
  return 1
}


# Retrieve only the credential username.
# This prints the username, not the password.
credential_username() {
  local name="$1"

  if [[ -z "$name" ]]; then
    echo "Usage: credential_username <system:profile>" >&2
    return 1
  fi

  security find-generic-password \
    -a "$USER" \
    -s "credential:${name}:username" \
    -w
}


# Retrieve the password.
#
# WARNING:
#   Calling this directly prints the password to stdout.
#
# Prefer credential_use or credential_exec.
credential_password() {
  local name="$1"

  if [[ -z "$name" ]]; then
    echo "Usage: credential_password <system:profile>" >&2
    return 1
  fi

  security find-generic-password \
    -a "$USER" \
    -s "credential:${name}:password" \
    -w
}


# Delete both parts of a stored credential.
credential_delete() {
  local name="$1"

  if [[ -z "$name" ]]; then
    echo "Usage: credential_delete <system:profile>"
    return 1
  fi

  security delete-generic-password \
    -a "$USER" \
    -s "credential:${name}:username" \
    2>/dev/null

  security delete-generic-password \
    -a "$USER" \
    -s "credential:${name}:password" \
    2>/dev/null

  echo "Credential removed from macOS Keychain: $name"
}


# Load a credential into two arbitrary environment variables.
#
# Example:
#   credential_use sql:production SQLCMDUSER SQLCMDPASSWORD
#
credential_use() {
  local name="$1"
  local username_variable="$2"
  local password_variable="$3"
  local username
  local password

  if [[ -z "$name" || -z "$username_variable" || -z "$password_variable" ]]; then
    echo "Usage: credential_use <system:profile> <username-env-var> <password-env-var>"
    return 1
  fi

  username="$(credential_username "$name")" || return 1
  password="$(credential_password "$name")" || {
    unset username
    return 1
  }

  typeset -gx "$username_variable=$username"
  typeset -gx "$password_variable=$password"

  TOKEN_ACTIVE_PROFILE[$username_variable]="credential:$name:username"
  TOKEN_ACTIVE_PROFILE[$password_variable]="credential:$name:password"

  unset username password

  echo "$username_variable / $password_variable -> credential:$name"
}


# Remove credential environment variables from the current shell.
#
# Example:
#   credential_unset SQLCMDUSER SQLCMDPASSWORD
#
credential_unset() {
  local username_variable="$1"
  local password_variable="$2"

  if [[ -z "$username_variable" || -z "$password_variable" ]]; then
    echo "Usage: credential_unset <username-env-var> <password-env-var>"
    return 1
  fi

  unset "$username_variable"
  unset "$password_variable"
  unset "TOKEN_ACTIVE_PROFILE[$username_variable]"
  unset "TOKEN_ACTIVE_PROFILE[$password_variable]"

  echo "$username_variable and $password_variable removed from current shell."
}


# Run one command with a stored username/password mapped to two
# child-process environment variables. The parent shell does not
# retain those values afterward.
#
# Example:
#   credential_exec \
#     sql:production \
#     SQLCMDUSER \
#     SQLCMDPASSWORD \
#     sqlcmd -S sql.example.com -d AppDb -Q 'SELECT @@VERSION'
#
credential_exec() {
  local name="$1"
  local username_variable="$2"
  local password_variable="$3"
  local username
  local password

  shift 3

  if [[ -z "$name" || -z "$username_variable" || -z "$password_variable" || $# -eq 0 ]]; then
    echo "Usage: credential_exec <system:profile> <username-env-var> <password-env-var> <command...>"
    return 1
  fi

  username="$(credential_username "$name")" || return 1
  password="$(credential_password "$name")" || {
    unset username
    return 1
  }

  env \
    "$username_variable=$username" \
    "$password_variable=$password" \
    "$@"

  local result=$?

  unset username password

  return $result
}


# ============================================================
# Cloudflare shortcuts
# ============================================================

# Select a Cloudflare token profile.
#
# Examples:
#   cf_use dns
#   cf_use workers
#   cf_use r2
#
# Maps "dns" to the Keychain token "cloudflare:dns".
cf_use() {
  local profile="$1"

  if [[ -z "$profile" ]]; then
    echo "Usage: cf_use <profile>"
    echo
    echo "Examples:"
    echo "  cf_use dns"
    echo "  cf_use workers"
    echo "  cf_use r2"
    echo "  cf_use readonly"
    return 1
  fi

  token_use CF_API_TOKEN "cloudflare:$profile"
}


cf_unload() {
  token_unset CF_API_TOKEN
}


cf_status() {
  token_status CF_API_TOKEN
}


# Verify whichever Cloudflare token is currently selected.
cf_verify() {
  if [[ -z "$CF_API_TOKEN" ]]; then
    echo "CF_API_TOKEN is not set."
    echo "Run: cf_use <profile>"
    return 1
  fi

  curl -sS \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/user/tokens/verify" |
    jq .
}


# Generic Cloudflare API request using the current CF_API_TOKEN.
#
# Examples:
#   cf_api GET "zones"
#   cf_api GET "accounts"
#
# POST example:
#   cf_api POST "zones/ZONE_ID/dns_records" \
#     -H "Content-Type: application/json" \
#     --data '{"type":"TXT","name":"example.com","content":"hello"}'
#
cf_api() {
  local method="$1"
  local endpoint="$2"

  shift 2

  if [[ -z "$CF_API_TOKEN" ]]; then
    echo "CF_API_TOKEN is not set."
    return 1
  fi

  if [[ -z "$method" || -z "$endpoint" ]]; then
    echo "Usage: cf_api <METHOD> <endpoint> [curl-options...]"
    return 1
  fi

  curl -sS \
    -X "$method" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    "$@" \
    "https://api.cloudflare.com/client/v4/$endpoint"
}


# List accessible Cloudflare zones in a formatted table.
cf_zones() {
  if [[ -z "$CF_API_TOKEN" ]]; then
    echo "CF_API_TOKEN is not set."
    echo "Run: cf_use <profile>"
    return 1
  fi

  {
    printf "DOMAIN\tZONE ID\tSTATUS\n"
    printf "------\t-------\t------\n"

    cf_api GET "zones?per_page=100" |
      jq -r '
        .result
        | sort_by(.name)
        | .[]
        | [
            .name,
            .id,
            .status
          ]
        | @tsv
      '
  } | column -t -s $'\t'
}


# Get a Cloudflare Zone ID from a domain name.
cf_zone_id() {
  local domain="$1"

  if [[ -z "$domain" ]]; then
    echo "Usage: cf_zone_id <domain>"
    return 1
  fi

  if [[ -z "$CF_API_TOKEN" ]]; then
    echo "CF_API_TOKEN is not set."
    echo "Run: cf_use <profile>"
    return 1
  fi

  curl -sS \
    -G \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    --data-urlencode "name=$domain" \
    "https://api.cloudflare.com/client/v4/zones" |
    jq -r '.result[0].id // empty'
}


# List DNS records for a Cloudflare zone.
#
# Compact/default mode truncates content longer than 60 chars:
#   cf_dns example.com
#
# Full mode shows complete record values:
#   cf_dns example.com --full
#
cf_dns() {
  local domain="$1"
  local mode="$2"
  local zone_id
  local full=false

  if [[ -z "$domain" ]]; then
    echo "Usage: cf_dns <domain> [--full]"
    return 1
  fi

  if [[ -n "$mode" && "$mode" != "--full" ]]; then
    echo "Unknown option: $mode"
    echo "Usage: cf_dns <domain> [--full]"
    return 1
  fi

  if [[ "$mode" == "--full" ]]; then
    full=true
  fi

  if [[ -z "$CF_API_TOKEN" ]]; then
    echo "CF_API_TOKEN is not set."
    echo "Run: cf_use <profile>"
    return 1
  fi

  zone_id="$(cf_zone_id "$domain")"

  if [[ -z "$zone_id" ]]; then
    echo "Unable to find Cloudflare zone: $domain"
    return 1
  fi

  {
    printf "TYPE\tNAME\tCONTENT\tPRIORITY\tTTL\tPROXIED\n"
    printf "----\t----\t-------\t--------\t---\t-------\n"

    cf_api GET "zones/$zone_id/dns_records?per_page=100" |
      jq -r \
        --argjson full "$full" '
        .result
        | sort_by(.type, .name)
        | .[]
        | [
            .type,
            .name,
            (
              if $full then
                .content
              elif (.content | length) > 60 then
                (.content[0:57] + "...")
              else
                .content
              end
            ),
            (.priority // "-"),
            (
              if .ttl == 1 then
                "Auto"
              else
                (.ttl | tostring)
              end
            ),
            (
              if .proxied == true then
                "Yes"
              elif .proxied == false then
                "No"
              else
                "-"
              end
            )
          ]
        | @tsv
      '
  } | column -t -s $'\t'
}


# ============================================================
# GitHub shortcuts
# ============================================================

# Generic applications commonly use GITHUB_TOKEN.
gh_use() {
  local profile="$1"

  if [[ -z "$profile" ]]; then
    echo "Usage: gh_use <profile>"
    return 1
  fi

  token_use GITHUB_TOKEN "github:$profile"
}


# GitHub CLI commonly uses GH_TOKEN.
gh_cli_use() {
  local profile="$1"

  if [[ -z "$profile" ]]; then
    echo "Usage: gh_cli_use <profile>"
    return 1
  fi

  token_use GH_TOKEN "github:$profile"
}


gh_unload() {
  unset GITHUB_TOKEN
  unset GH_TOKEN
  unset "TOKEN_ACTIVE_PROFILE[GITHUB_TOKEN]"
  unset "TOKEN_ACTIVE_PROFILE[GH_TOKEN]"
  echo "GitHub token environment variables removed from current shell."
}


gh_status() {
  token_status GITHUB_TOKEN
}


# ============================================================
# MailerSend shortcuts
# ============================================================

mailersend_use() {
  local profile="$1"

  if [[ -z "$profile" ]]; then
    echo "Usage: mailersend_use <profile>"
    return 1
  fi

  token_use MAILERSEND_API_TOKEN "mailersend:$profile"
}


mailersend_unload() {
  token_unset MAILERSEND_API_TOKEN
}


mailersend_status() {
  token_status MAILERSEND_API_TOKEN
}
```

Reload the profile:

```bash
source ~/.zshrc
```

Or open a new terminal.

---

## 3. Zsh walkthrough

### 3.1 Store multiple Cloudflare tokens

```bash
token_set cloudflare:dns
token_set cloudflare:workers
token_set cloudflare:r2
```

Each command prompts for the token without displaying it.

Check whether a token exists:

```bash
token_exists cloudflare:dns
```

Select the DNS token:

```bash
cf_use dns
```

Expected status:

```text
CF_API_TOKEN -> cloudflare:dns
```

Check without displaying the secret:

```bash
cf_status
```

Verify it against Cloudflare:

```bash
cf_verify
```

Switch to another token immediately:

```bash
cf_use workers
```

`CF_API_TOKEN` now contains the `cloudflare:workers` token instead. No shell restart is required.

Remove the value from the current shell:

```bash
cf_unload
```

The Keychain entry remains intact.

---

### 3.2 Cloudflare zone and DNS helpers

List zones:

```bash
cf_use dns
cf_zones
```

Example output:

```text
DOMAIN                    ZONE ID                           STATUS
------                    -------                           ------
aethonjobs.com            a01edee5fcdfcda2237db7cc0f469507  active
how-to-use-ai.com         ff1d2ccd3cdc81d1113a441604f6f6d1  active
repasscloud.com           d6315cf2067d30b6c451911b98921240  active
```

Get one zone ID:

```bash
cf_zone_id how-to-use-ai.com
```

Compact DNS output:

```bash
cf_dns how-to-use-ai.com
```

Full DNS output:

```bash
cf_dns how-to-use-ai.com --full
```

The default view truncates very long TXT, DKIM, SPF, and verification values to keep the table usable. `--full` displays the complete values.

---

### 3.3 Store a SQL username/password credential

Create a logical credential:

```bash
credential_set sql:production
```

You are prompted for:

```text
Username for sql:production:
Password for sql:production:
```

The username and password are stored as separate Keychain items associated with the current macOS user.

Check it exists:

```bash
credential_exists sql:production
```

---

### 3.4 Use SQL credentials without putting the password on the command line

Microsoft documents `SQLCMDUSER` and `SQLCMDPASSWORD` environment variables and specifically recommends avoiding `sqlcmd -P` because a password supplied on the command line is insecure.

For one command only:

```bash
credential_exec \
  sql:production \
  SQLCMDUSER \
  SQLCMDPASSWORD \
  sqlcmd \
    -S sql.example.com \
    -d ApplicationDb \
    -Q 'SELECT @@VERSION'
```

The child `sqlcmd` process receives:

```text
SQLCMDUSER=<stored username>
SQLCMDPASSWORD=<stored password>
```

The parent shell does not retain them after the command exits.

For several commands in the same terminal session:

```bash
credential_use sql:production SQLCMDUSER SQLCMDPASSWORD
```

Then:

```bash
sqlcmd -S sql.example.com -d ApplicationDb -Q 'SELECT @@VERSION'
sqlcmd -S sql.example.com -d ApplicationDb -Q 'SELECT DB_NAME()'
```

When finished:

```bash
credential_unset SQLCMDUSER SQLCMDPASSWORD
```

Do not use this unless the target program actually supports those environment variables. `credential_use` simply maps a stored credential to names you choose.

---

### 3.5 Use a username/password in the middle of a generic command

Some tools do not provide a dedicated environment-variable mechanism. You can retrieve the values:

```bash
APP_USER="$(credential_username legacy-api:production)"
APP_PASS="$(credential_password legacy-api:production)"

some-command --user "$APP_USER" --password "$APP_PASS"

unset APP_USER APP_PASS
```

This is supported, but it is less desirable than a tool-specific environment variable or stdin mechanism because command-line arguments can be observable through process inspection on some systems.

Preferred order:

1. native authentication/session support;
2. tool-supported environment variables;
3. stdin or file descriptor mechanisms;
4. command-line password arguments only when the tool provides no safer alternative.

---

## 4. PowerShell implementation

The PowerShell implementation intentionally uses platform-native security:

- **Windows PowerShell 5.1:** DPAPI-protected CLIXML files.
- **PowerShell 7.x on Windows:** the same DPAPI-protected CLIXML files.
- **PowerShell 7.x on macOS:** the native macOS Keychain and the **same Keychain names used by the Zsh implementation**.
- **PowerShell 7.x on Linux:** storage functions stop with an error rather than writing reversible plaintext credentials.

On Windows, Microsoft documents that `Export-Clixml` encrypts exported credential objects with Windows Data Protection API and that only the same user account on the same computer can decrypt them.

On macOS/Linux, Microsoft explicitly documents that `Export-Clixml` does **not** provide credential encryption. This is why macOS uses Keychain and Linux is not silently downgraded to CLIXML.

---

## 5. Install the PowerShell profile code

Find the current PowerShell profile path:

```powershell
$PROFILE
```

Create it if it does not exist:

```powershell
if (-not (Test-Path -LiteralPath $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force | Out-Null
}
```

Open it in VS Code if available:

```powershell
code $PROFILE
```

Or on Windows:

```powershell
notepad $PROFILE
```

Paste the complete block below into the profile.

The code deliberately avoids PowerShell 7-only syntax such as `??`, ternary operators, and pipeline-chain operators so that it remains compatible with **Windows PowerShell 5.1**.

---

## 6. Complete PowerShell profile code — 5.1 and 7.x compatible

```powershell
# ============================================================
# Per-user API token and credential manager
# PowerShell 5.1 / PowerShell 7.x
# Version: 3.0
# ============================================================
#
# Windows:
#   Secrets are persisted with Export-Clixml and protected with
#   Windows DPAPI for the current user on the current computer.
#
# macOS:
#   Secrets are persisted in the native macOS Keychain and use
#   the same logical names as the Zsh implementation.
#
# Linux:
#   Persistent local secret storage is intentionally rejected by
#   these helpers because Export-Clixml does not encrypt secrets
#   on non-Windows platforms.
# ============================================================


# ------------------------------------------------------------
# Internal state
# ------------------------------------------------------------

if (-not (Get-Variable -Name TokenActiveProfile -Scope Global -ErrorAction SilentlyContinue)) {
    $Global:TokenActiveProfile = @{}
}


# ------------------------------------------------------------
# Platform helpers
# ------------------------------------------------------------

function Test-IsWindowsPlatform {
    if ($PSVersionTable.PSEdition -eq 'Desktop') {
        return $true
    }

    return [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform(
        [System.Runtime.InteropServices.OSPlatform]::Windows
    )
}


function Test-IsMacOSPlatform {
    if ($PSVersionTable.PSEdition -eq 'Desktop') {
        return $false
    }

    return [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform(
        [System.Runtime.InteropServices.OSPlatform]::OSX
    )
}


function Get-LocalSecretUserName {
    if (-not [string]::IsNullOrWhiteSpace($env:USER)) {
        return $env:USER
    }

    return [System.Environment]::UserName
}


# ------------------------------------------------------------
# SecureString conversion helper
# ------------------------------------------------------------
#
# This is used only at the point where an external application
# requires plaintext in an environment variable or macOS Keychain
# command. The returned plaintext should be kept in memory for the
# shortest practical time.
#
function ConvertFrom-SecureStringToPlainText {
    param(
        [Parameter(Mandatory = $true)]
        [System.Security.SecureString]$SecureString
    )

    $bstr = [System.IntPtr]::Zero

    try {
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
        return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        if ($bstr -ne [System.IntPtr]::Zero) {
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}


# ------------------------------------------------------------
# Windows DPAPI storage paths
# ------------------------------------------------------------

function Get-SecretStoreRoot {
    if (-not (Test-IsWindowsPlatform)) {
        throw 'The DPAPI file store is only available on Windows.'
    }

    $root = Join-Path $env:APPDATA 'ShellSecrets'

    if (-not (Test-Path -LiteralPath $root)) {
        New-Item -ItemType Directory -Path $root -Force | Out-Null
    }

    return $root
}


# Encode arbitrary logical names into filename-safe Base64URL.
# This avoids collisions caused by replacing ':' or '/' manually.
function ConvertTo-SecretFileName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Name)
    $value = [System.Convert]::ToBase64String($bytes)
    $value = $value.TrimEnd('=')
    $value = $value.Replace('+', '-')
    $value = $value.Replace('/', '_')

    return $value
}


function Get-TokenSecretPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $fileName = 'token-{0}.xml' -f (ConvertTo-SecretFileName -Name $Name)
    return Join-Path (Get-SecretStoreRoot) $fileName
}


function Get-CredentialSecretPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $fileName = 'credential-{0}.xml' -f (ConvertTo-SecretFileName -Name $Name)
    return Join-Path (Get-SecretStoreRoot) $fileName
}


# ============================================================
# Token storage
# ============================================================

function Set-TokenSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    $secure = Read-Host "Token for $Name" -AsSecureString

    if (Test-IsWindowsPlatform) {
        $path = Get-TokenSecretPath -Name $Name
        $secure | Export-Clixml -LiteralPath $path -Force
        Write-Host "Stored for current Windows user: $Name"
        return
    }

    if (Test-IsMacOSPlatform) {
        $plain = ConvertFrom-SecureStringToPlainText -SecureString $secure

        try {
            $userName = Get-LocalSecretUserName
            & security add-generic-password -U -a $userName -s $Name -w $plain | Out-Null

            if ($LASTEXITCODE -ne 0) {
                throw "macOS Keychain failed while storing '$Name'."
            }

            Write-Host "Stored in macOS Keychain: $Name"
        }
        finally {
            $plain = $null
            $secure = $null
        }

        return
    }

    throw 'Secure local token storage is not configured for this operating system.'
}


function Get-TokenSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $path = Get-TokenSecretPath -Name $Name

        if (-not (Test-Path -LiteralPath $path)) {
            throw "Token does not exist: $Name"
        }

        $secure = Import-Clixml -LiteralPath $path
        return ConvertFrom-SecureStringToPlainText -SecureString $secure
    }

    if (Test-IsMacOSPlatform) {
        $userName = Get-LocalSecretUserName
        $value = & security find-generic-password -a $userName -s $Name -w 2>$null

        if ($LASTEXITCODE -ne 0) {
            throw "Token does not exist in macOS Keychain: $Name"
        }

        return $value
    }

    throw 'Secure local token storage is not configured for this operating system.'
}


function Test-TokenSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $exists = Test-Path -LiteralPath (Get-TokenSecretPath -Name $Name)
    }
    elseif (Test-IsMacOSPlatform) {
        $userName = Get-LocalSecretUserName
        & security find-generic-password -a $userName -s $Name *> $null
        $exists = ($LASTEXITCODE -eq 0)
    }
    else {
        throw 'Secure local token storage is not configured for this operating system.'
    }

    if ($exists) {
        Write-Host "$Name exists."
        return $true
    }

    Write-Host "$Name does not exist."
    return $false
}


function Remove-TokenSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $path = Get-TokenSecretPath -Name $Name

        if (Test-Path -LiteralPath $path) {
            Remove-Item -LiteralPath $path -Force
        }

        Write-Host "Removed token: $Name"
        return
    }

    if (Test-IsMacOSPlatform) {
        $userName = Get-LocalSecretUserName
        & security delete-generic-password -a $userName -s $Name 2>$null | Out-Null
        Write-Host "Removed token: $Name"
        return
    }

    throw 'Secure local token storage is not configured for this operating system.'
}


# ============================================================
# Token environment-variable management
# ============================================================

function Use-TokenSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$EnvironmentVariable,

        [Parameter(Mandatory = $true, Position = 1)]
        [string]$Name
    )

    $secret = Get-TokenSecret -Name $Name

    try {
        [System.Environment]::SetEnvironmentVariable(
            $EnvironmentVariable,
            $secret,
            [System.EnvironmentVariableTarget]::Process
        )

        $Global:TokenActiveProfile[$EnvironmentVariable] = $Name
        Write-Host "$EnvironmentVariable -> $Name"
    }
    finally {
        $secret = $null
    }
}


function Remove-TokenEnvironment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$EnvironmentVariable
    )

    [System.Environment]::SetEnvironmentVariable(
        $EnvironmentVariable,
        $null,
        [System.EnvironmentVariableTarget]::Process
    )

    if ($Global:TokenActiveProfile.ContainsKey($EnvironmentVariable)) {
        $Global:TokenActiveProfile.Remove($EnvironmentVariable)
    }

    Write-Host "$EnvironmentVariable removed from current PowerShell process."
}


function Get-TokenEnvironmentStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$EnvironmentVariable
    )

    $value = [System.Environment]::GetEnvironmentVariable(
        $EnvironmentVariable,
        [System.EnvironmentVariableTarget]::Process
    )

    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "$EnvironmentVariable is not set."
        return
    }

    if ($Global:TokenActiveProfile.ContainsKey($EnvironmentVariable)) {
        Write-Host "$EnvironmentVariable is set from: $($Global:TokenActiveProfile[$EnvironmentVariable])"
    }
    else {
        Write-Host "$EnvironmentVariable is set, but its source profile is unknown."
    }
}


# Run one command with a temporary token environment variable and
# restore the previous process value afterward.
function Invoke-WithToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$EnvironmentVariable,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Command,

        [string[]]$ArgumentList = @()
    )

    $previous = [System.Environment]::GetEnvironmentVariable(
        $EnvironmentVariable,
        [System.EnvironmentVariableTarget]::Process
    )

    $secret = Get-TokenSecret -Name $Name

    try {
        [System.Environment]::SetEnvironmentVariable(
            $EnvironmentVariable,
            $secret,
            [System.EnvironmentVariableTarget]::Process
        )

        & $Command @ArgumentList
    }
    finally {
        [System.Environment]::SetEnvironmentVariable(
            $EnvironmentVariable,
            $previous,
            [System.EnvironmentVariableTarget]::Process
        )

        $secret = $null
        $previous = $null
    }
}


# ============================================================
# Username/password credential storage
# ============================================================

function Set-CredentialSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    $credential = Get-Credential -Message "Credential for $Name"

    if ($null -eq $credential) {
        throw 'Credential entry was cancelled.'
    }

    if (Test-IsWindowsPlatform) {
        $path = Get-CredentialSecretPath -Name $Name
        $credential | Export-Clixml -LiteralPath $path -Force
        Write-Host "Credential stored for current Windows user: $Name"
        return
    }

    if (Test-IsMacOSPlatform) {
        $userName = Get-LocalSecretUserName
        $plainPassword = ConvertFrom-SecureStringToPlainText -SecureString $credential.Password

        try {
            & security add-generic-password `
                -U `
                -a $userName `
                -s "credential:${Name}:username" `
                -w $credential.UserName | Out-Null

            if ($LASTEXITCODE -ne 0) {
                throw "Unable to store username for credential '$Name'."
            }

            & security add-generic-password `
                -U `
                -a $userName `
                -s "credential:${Name}:password" `
                -w $plainPassword | Out-Null

            if ($LASTEXITCODE -ne 0) {
                throw "Unable to store password for credential '$Name'."
            }

            Write-Host "Credential stored in macOS Keychain: $Name"
        }
        finally {
            $plainPassword = $null
            $credential = $null
        }

        return
    }

    throw 'Secure local credential storage is not configured for this operating system.'
}


function Get-CredentialSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $path = Get-CredentialSecretPath -Name $Name

        if (-not (Test-Path -LiteralPath $path)) {
            throw "Credential does not exist: $Name"
        }

        $credential = Import-Clixml -LiteralPath $path

        # Explicit cast helps preserve compatibility across Windows
        # PowerShell 5.1 and PowerShell 7.x deserialization behavior.
        return [System.Management.Automation.PSCredential]$credential
    }

    if (Test-IsMacOSPlatform) {
        $localUser = Get-LocalSecretUserName

        $remoteUser = & security find-generic-password `
            -a $localUser `
            -s "credential:${Name}:username" `
            -w 2>$null

        if ($LASTEXITCODE -ne 0) {
            throw "Credential username does not exist: $Name"
        }

        $plainPassword = & security find-generic-password `
            -a $localUser `
            -s "credential:${Name}:password" `
            -w 2>$null

        if ($LASTEXITCODE -ne 0) {
            throw "Credential password does not exist: $Name"
        }

        try {
            $securePassword = ConvertTo-SecureString -String $plainPassword -AsPlainText -Force
            return New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $remoteUser, $securePassword
        }
        finally {
            $plainPassword = $null
        }
    }

    throw 'Secure local credential storage is not configured for this operating system.'
}


function Test-CredentialSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $exists = Test-Path -LiteralPath (Get-CredentialSecretPath -Name $Name)
    }
    elseif (Test-IsMacOSPlatform) {
        $localUser = Get-LocalSecretUserName

        & security find-generic-password -a $localUser -s "credential:${Name}:username" *> $null
        $userExists = ($LASTEXITCODE -eq 0)

        & security find-generic-password -a $localUser -s "credential:${Name}:password" *> $null
        $passwordExists = ($LASTEXITCODE -eq 0)

        $exists = ($userExists -and $passwordExists)
    }
    else {
        throw 'Secure local credential storage is not configured for this operating system.'
    }

    if ($exists) {
        Write-Host "$Name exists."
        return $true
    }

    Write-Host "$Name does not exist or is incomplete."
    return $false
}


function Remove-CredentialSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Name
    )

    if (Test-IsWindowsPlatform) {
        $path = Get-CredentialSecretPath -Name $Name

        if (Test-Path -LiteralPath $path) {
            Remove-Item -LiteralPath $path -Force
        }

        Write-Host "Removed credential: $Name"
        return
    }

    if (Test-IsMacOSPlatform) {
        $localUser = Get-LocalSecretUserName

        & security delete-generic-password `
            -a $localUser `
            -s "credential:${Name}:username" `
            2>$null | Out-Null

        & security delete-generic-password `
            -a $localUser `
            -s "credential:${Name}:password" `
            2>$null | Out-Null

        Write-Host "Removed credential: $Name"
        return
    }

    throw 'Secure local credential storage is not configured for this operating system.'
}


# Load username/password into arbitrary process environment variables.
function Use-CredentialSecret {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$UsernameEnvironmentVariable,

        [Parameter(Mandatory = $true)]
        [string]$PasswordEnvironmentVariable
    )

    $credential = Get-CredentialSecret -Name $Name
    $plainPassword = ConvertFrom-SecureStringToPlainText -SecureString $credential.Password

    try {
        [System.Environment]::SetEnvironmentVariable(
            $UsernameEnvironmentVariable,
            $credential.UserName,
            [System.EnvironmentVariableTarget]::Process
        )

        [System.Environment]::SetEnvironmentVariable(
            $PasswordEnvironmentVariable,
            $plainPassword,
            [System.EnvironmentVariableTarget]::Process
        )

        $Global:TokenActiveProfile[$UsernameEnvironmentVariable] = "credential:$Name:username"
        $Global:TokenActiveProfile[$PasswordEnvironmentVariable] = "credential:$Name:password"

        Write-Host "$UsernameEnvironmentVariable / $PasswordEnvironmentVariable -> credential:$Name"
    }
    finally {
        $plainPassword = $null
        $credential = $null
    }
}


function Remove-CredentialEnvironment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$UsernameEnvironmentVariable,

        [Parameter(Mandatory = $true)]
        [string]$PasswordEnvironmentVariable
    )

    [System.Environment]::SetEnvironmentVariable(
        $UsernameEnvironmentVariable,
        $null,
        [System.EnvironmentVariableTarget]::Process
    )

    [System.Environment]::SetEnvironmentVariable(
        $PasswordEnvironmentVariable,
        $null,
        [System.EnvironmentVariableTarget]::Process
    )

    if ($Global:TokenActiveProfile.ContainsKey($UsernameEnvironmentVariable)) {
        $Global:TokenActiveProfile.Remove($UsernameEnvironmentVariable)
    }

    if ($Global:TokenActiveProfile.ContainsKey($PasswordEnvironmentVariable)) {
        $Global:TokenActiveProfile.Remove($PasswordEnvironmentVariable)
    }

    Write-Host "$UsernameEnvironmentVariable and $PasswordEnvironmentVariable removed from current PowerShell process."
}


# Run one command with temporary username/password environment
# variables and restore any previous process values afterward.
function Invoke-WithCredential {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$UsernameEnvironmentVariable,

        [Parameter(Mandatory = $true)]
        [string]$PasswordEnvironmentVariable,

        [Parameter(Mandatory = $true)]
        [string]$Command,

        [string[]]$ArgumentList = @()
    )

    $previousUser = [System.Environment]::GetEnvironmentVariable(
        $UsernameEnvironmentVariable,
        [System.EnvironmentVariableTarget]::Process
    )

    $previousPassword = [System.Environment]::GetEnvironmentVariable(
        $PasswordEnvironmentVariable,
        [System.EnvironmentVariableTarget]::Process
    )

    $credential = Get-CredentialSecret -Name $Name
    $plainPassword = ConvertFrom-SecureStringToPlainText -SecureString $credential.Password

    try {
        [System.Environment]::SetEnvironmentVariable(
            $UsernameEnvironmentVariable,
            $credential.UserName,
            [System.EnvironmentVariableTarget]::Process
        )

        [System.Environment]::SetEnvironmentVariable(
            $PasswordEnvironmentVariable,
            $plainPassword,
            [System.EnvironmentVariableTarget]::Process
        )

        & $Command @ArgumentList
    }
    finally {
        [System.Environment]::SetEnvironmentVariable(
            $UsernameEnvironmentVariable,
            $previousUser,
            [System.EnvironmentVariableTarget]::Process
        )

        [System.Environment]::SetEnvironmentVariable(
            $PasswordEnvironmentVariable,
            $previousPassword,
            [System.EnvironmentVariableTarget]::Process
        )

        $plainPassword = $null
        $credential = $null
        $previousUser = $null
        $previousPassword = $null
    }
}


# ============================================================
# Cloudflare shortcuts - PowerShell
# ============================================================

function Use-CloudflareToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Profile
    )

    Use-TokenSecret -EnvironmentVariable 'CF_API_TOKEN' -Name "cloudflare:$Profile"
}


function Remove-CloudflareToken {
    Remove-TokenEnvironment -EnvironmentVariable 'CF_API_TOKEN'
}


function Get-CloudflareTokenStatus {
    Get-TokenEnvironmentStatus -EnvironmentVariable 'CF_API_TOKEN'
}


function Test-CloudflareToken {
    if ([string]::IsNullOrEmpty($env:CF_API_TOKEN)) {
        throw 'CF_API_TOKEN is not set. Run: Use-CloudflareToken dns'
    }

    Invoke-RestMethod `
        -Method Get `
        -Uri 'https://api.cloudflare.com/client/v4/user/tokens/verify' `
        -Headers @{ Authorization = "Bearer $env:CF_API_TOKEN" }
}


function Get-CloudflareZones {
    if ([string]::IsNullOrEmpty($env:CF_API_TOKEN)) {
        throw 'CF_API_TOKEN is not set. Run: Use-CloudflareToken dns'
    }

    $response = Invoke-RestMethod `
        -Method Get `
        -Uri 'https://api.cloudflare.com/client/v4/zones?per_page=100' `
        -Headers @{ Authorization = "Bearer $env:CF_API_TOKEN" }

    $response.result |
        Sort-Object name |
        Select-Object `
            @{ Name = 'Domain'; Expression = { $_.name } }, `
            @{ Name = 'ZoneId'; Expression = { $_.id } }, `
            @{ Name = 'Status'; Expression = { $_.status } } |
        Format-Table -AutoSize
}


function Get-CloudflareZoneId {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Domain
    )

    if ([string]::IsNullOrEmpty($env:CF_API_TOKEN)) {
        throw 'CF_API_TOKEN is not set. Run: Use-CloudflareToken dns'
    }

    $encodedDomain = [System.Uri]::EscapeDataString($Domain)

    $response = Invoke-RestMethod `
        -Method Get `
        -Uri "https://api.cloudflare.com/client/v4/zones?name=$encodedDomain" `
        -Headers @{ Authorization = "Bearer $env:CF_API_TOKEN" }

    if ($response.result.Count -eq 0) {
        return $null
    }

    return $response.result[0].id
}


function Get-CloudflareDns {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Domain,

        [switch]$Full
    )

    if ([string]::IsNullOrEmpty($env:CF_API_TOKEN)) {
        throw 'CF_API_TOKEN is not set. Run: Use-CloudflareToken dns'
    }

    $zoneId = Get-CloudflareZoneId -Domain $Domain

    if ([string]::IsNullOrEmpty($zoneId)) {
        throw "Unable to find Cloudflare zone: $Domain"
    }

    $response = Invoke-RestMethod `
        -Method Get `
        -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?per_page=100" `
        -Headers @{ Authorization = "Bearer $env:CF_API_TOKEN" }

    $records = foreach ($record in ($response.result | Sort-Object type, name)) {
        $content = [string]$record.content

        if (-not $Full -and $content.Length -gt 60) {
            $content = $content.Substring(0, 57) + '...'
        }

        $priority = '-'
        if ($null -ne $record.priority) {
            $priority = $record.priority
        }

        $ttl = $record.ttl
        if ($ttl -eq 1) {
            $ttl = 'Auto'
        }

        $proxied = '-'
        if ($record.proxied -eq $true) {
            $proxied = 'Yes'
        }
        elseif ($record.proxied -eq $false) {
            $proxied = 'No'
        }

        [PSCustomObject]@{
            Type     = $record.type
            Name     = $record.name
            Content  = $content
            Priority = $priority
            TTL      = $ttl
            Proxied  = $proxied
        }
    }

    $records | Format-Table -AutoSize
}


# ============================================================
# GitHub / MailerSend shortcuts - PowerShell
# ============================================================

function Use-GitHubToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Profile
    )

    Use-TokenSecret -EnvironmentVariable 'GITHUB_TOKEN' -Name "github:$Profile"
}


function Use-GitHubCliToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Profile
    )

    Use-TokenSecret -EnvironmentVariable 'GH_TOKEN' -Name "github:$Profile"
}


function Use-MailerSendToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Profile
    )

    Use-TokenSecret -EnvironmentVariable 'MAILERSEND_API_TOKEN' -Name "mailersend:$Profile"
}
```

Reload the PowerShell profile:

```powershell
. $PROFILE
```

Or open a new PowerShell session.

---

## 7. PowerShell walkthrough

### 7.1 Store API tokens

Cloudflare DNS:

```powershell
Set-TokenSecret cloudflare:dns
```

Cloudflare Workers:

```powershell
Set-TokenSecret cloudflare:workers
```

GitHub repository token:

```powershell
Set-TokenSecret github:repos
```

On Windows these are DPAPI-protected files under the current user's roaming application-data folder:

```powershell
Join-Path $env:APPDATA 'ShellSecrets'
```

The files are intentionally only decryptable by the same Windows user on the same computer.

On macOS PowerShell 7 uses Keychain, so:

```powershell
Set-TokenSecret cloudflare:dns
```

and Zsh:

```bash
token_set cloudflare:dns
```

refer to the same Keychain service name for that local macOS user.

---

### 7.2 Select and switch Cloudflare tokens

```powershell
Use-CloudflareToken dns
```

Check:

```powershell
Get-CloudflareTokenStatus
```

Verify:

```powershell
Test-CloudflareToken
```

Switch:

```powershell
Use-CloudflareToken workers
```

`CF_API_TOKEN` is replaced for the current PowerShell process.

Unload it:

```powershell
Remove-CloudflareToken
```

---

### 7.3 Cloudflare PowerShell helpers

```powershell
Use-CloudflareToken dns
Get-CloudflareZones
```

Get one Zone ID:

```powershell
Get-CloudflareZoneId how-to-use-ai.com
```

Compact DNS:

```powershell
Get-CloudflareDns how-to-use-ai.com
```

Full DNS values:

```powershell
Get-CloudflareDns how-to-use-ai.com -Full
```

---

### 7.4 Store username/password credentials

```powershell
Set-CredentialSecret sql:production
```

PowerShell displays a credential prompt.

On Windows the resulting `PSCredential` is protected by DPAPI for the current user/current machine.

On macOS the username/password are stored in the current user's Keychain using the same names as the Zsh credential implementation.

Check:

```powershell
Test-CredentialSecret sql:production
```

Retrieve as a native `PSCredential` object:

```powershell
$credential = Get-CredentialSecret sql:production
```

This is preferable whenever the target cmdlet directly accepts `-Credential`:

```powershell
Some-Cmdlet -Credential $credential
```

The password remains a `SecureString` inside the `PSCredential` object until a target application requires plaintext.

---

## 8. SQL examples

### 8.1 PowerShell — one SQL command

Use the stored SQL credential only for the duration of the command:

```powershell
Invoke-WithCredential `
    -Name 'sql:production' `
    -UsernameEnvironmentVariable 'SQLCMDUSER' `
    -PasswordEnvironmentVariable 'SQLCMDPASSWORD' `
    -Command 'sqlcmd' `
    -ArgumentList @(
        '-S', 'sql.example.com',
        '-d', 'ApplicationDb',
        '-Q', 'SELECT @@VERSION'
    )
```

The previous values of `SQLCMDUSER` and `SQLCMDPASSWORD`, if any, are restored afterward.

### 8.2 PowerShell — several SQL commands

```powershell
Use-CredentialSecret `
    -Name 'sql:production' `
    -UsernameEnvironmentVariable 'SQLCMDUSER' `
    -PasswordEnvironmentVariable 'SQLCMDPASSWORD'
```

Then:

```powershell
sqlcmd -S sql.example.com -d ApplicationDb -Q 'SELECT @@VERSION'
sqlcmd -S sql.example.com -d ApplicationDb -Q 'SELECT DB_NAME()'
```

When finished:

```powershell
Remove-CredentialEnvironment `
    -UsernameEnvironmentVariable 'SQLCMDUSER' `
    -PasswordEnvironmentVariable 'SQLCMDPASSWORD'
```

### 8.3 Why not `sqlcmd -P`?

Microsoft's current `sqlcmd` documentation explicitly states that using `-P` should be considered insecure and recommends `SQLCMDPASSWORD` or interactive input instead.

Using:

```text
SQLCMDUSER
SQLCMDPASSWORD
```

also avoids hard-coding a password into a script or leaving it in shell history as a literal command-line argument.

Environment variables are still plaintext inside the process environment while the child process is running. They should therefore be loaded only for as long as required.

---

## 9. Generic command examples

### 9.1 One token, one child command — Zsh

```bash
token_exec \
  GITHUB_TOKEN \
  github:repos \
  ./publish.sh
```

### 9.2 One token, one child command — PowerShell

```powershell
Invoke-WithToken `
    -EnvironmentVariable 'GITHUB_TOKEN' `
    -Name 'github:repos' `
    -Command './publish.ps1'
```

### 9.3 Temporarily load a token — Zsh

```bash
token_use OPENAI_API_KEY openai:development
```

Use it, then:

```bash
token_unset OPENAI_API_KEY
```

### 9.4 Temporarily load a token — PowerShell

```powershell
Use-TokenSecret OPENAI_API_KEY openai:development
```

Then:

```powershell
Remove-TokenEnvironment OPENAI_API_KEY
```

---

## 10. Rotation and replacement

### Zsh/macOS

Replace a stored token simply by running:

```bash
token_set cloudflare:dns
```

The underlying `security add-generic-password -U` updates the existing item.

If the old version is already exported, reload it:

```bash
cf_use dns
```

### PowerShell

Replace a stored token:

```powershell
Set-TokenSecret cloudflare:dns
```

Reload it into the environment if required:

```powershell
Use-CloudflareToken dns
```

---

## 11. Deletion versus unloading

These are intentionally different operations.

**Unload** means remove the plaintext value from the current shell/process while retaining the stored secret:

Zsh:

```bash
cf_unload
token_unset GITHUB_TOKEN
credential_unset SQLCMDUSER SQLCMDPASSWORD
```

PowerShell:

```powershell
Remove-CloudflareToken
Remove-TokenEnvironment GITHUB_TOKEN
Remove-CredentialEnvironment SQLCMDUSER SQLCMDPASSWORD
```

**Delete** means remove the persistent stored secret:

Zsh:

```bash
token_delete cloudflare:dns
credential_delete sql:production
```

PowerShell:

```powershell
Remove-TokenSecret cloudflare:dns
Remove-CredentialSecret sql:production
```

Deleting a stored secret does not retroactively erase copies that are already loaded into a running process. Unload those separately.

---

## 12. Security characteristics

### macOS

The Zsh and PowerShell 7 implementations use macOS Keychain. Entries are also created with the current local username as the Keychain account field.

The profile files contain only helper code and logical names such as:

```text
cloudflare:dns
sql:production
```

They do not contain the secrets.

### Windows PowerShell 5.1 / PowerShell 7.x

The Windows implementation uses `Export-Clixml` with `SecureString`/`PSCredential` objects. On Windows, PowerShell uses Windows DPAPI to encrypt them.

Microsoft states that the encrypted credential can only be decrypted by:

- the same Windows user account;
- on the same computer.

That is intentionally stricter than machine-wide secret storage.

### PowerShell 7 on macOS/Linux

Do **not** copy the Windows CLIXML approach to macOS or Linux. Microsoft documents that exported credentials on non-Windows platforms are not encrypted; the password is only represented as a Unicode character array.

This guide therefore:

- uses Keychain on macOS;
- refuses the local CLIXML approach on Linux.

For Linux, use a real secret backend such as a desktop keyring/libsecret, a password-manager CLI, a cloud vault, or another security product appropriate to the environment.

---

## 13. Important operational rules

1. **Never put actual secrets in `.zshrc`, `$PROFILE`, source control, dotfile repositories, or documentation.**
2. Use descriptive profile names rather than numbered tokens.
3. Give API tokens the minimum permissions they need.
4. Prefer one-shot execution (`token_exec` / `Invoke-WithToken`) for automation where practical.
5. Prefer native credential objects such as `PSCredential` where a PowerShell cmdlet supports them.
6. Prefer tool-supported password environment variables over command-line password switches.
7. Unload long-lived plaintext environment variables when finished.
8. Revoke compromised API tokens at the provider; deleting a local Keychain/DPAPI copy does not revoke the remote credential.
9. Do not print secrets to diagnostic output.
10. Be careful with `set -x`, shell tracing, PowerShell transcript logging, CI logs, and verbose debugging when secrets are in environment variables.

---

## 14. Quick-reference commands

### Zsh

```bash
# Tokens
token_set cloudflare:dns
token_exists cloudflare:dns
token_use CF_API_TOKEN cloudflare:dns
token_status CF_API_TOKEN
token_unset CF_API_TOKEN
token_delete cloudflare:dns

# Cloudflare
cf_use dns
cf_status
cf_verify
cf_zones
cf_zone_id how-to-use-ai.com
cf_dns how-to-use-ai.com
cf_dns how-to-use-ai.com --full
cf_unload

# Credentials
credential_set sql:production
credential_exists sql:production
credential_use sql:production SQLCMDUSER SQLCMDPASSWORD
credential_unset SQLCMDUSER SQLCMDPASSWORD
credential_delete sql:production
```

### PowerShell 5.1 / 7.x

```powershell
# Tokens
Set-TokenSecret cloudflare:dns
Test-TokenSecret cloudflare:dns
Use-TokenSecret CF_API_TOKEN cloudflare:dns
Get-TokenEnvironmentStatus CF_API_TOKEN
Remove-TokenEnvironment CF_API_TOKEN
Remove-TokenSecret cloudflare:dns

# Cloudflare
Use-CloudflareToken dns
Get-CloudflareTokenStatus
Test-CloudflareToken
Get-CloudflareZones
Get-CloudflareZoneId how-to-use-ai.com
Get-CloudflareDns how-to-use-ai.com
Get-CloudflareDns how-to-use-ai.com -Full
Remove-CloudflareToken

# Credentials
Set-CredentialSecret sql:production
Test-CredentialSecret sql:production
$credential = Get-CredentialSecret sql:production
Use-CredentialSecret `
    -Name sql:production `
    -UsernameEnvironmentVariable SQLCMDUSER `
    -PasswordEnvironmentVariable SQLCMDPASSWORD
Remove-CredentialEnvironment SQLCMDUSER SQLCMDPASSWORD
Remove-CredentialSecret sql:production
```

---

## 15. Sources and implementation notes

Microsoft PowerShell documentation for `Export-Clixml` explains the Windows DPAPI behavior and explicitly warns that non-Windows exported credentials are not encrypted:

- [https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/export-clixml](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/export-clixml)
- [https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/import-clixml](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/import-clixml)

Microsoft SQL `sqlcmd` documentation describes `SQLCMDUSER`/`SQLCMDPASSWORD` and recommends avoiding passwords supplied with `-P`:

- [https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-utility](https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-utility)
- [https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-use-scripting-variables](https://learn.microsoft.com/sql/tools/sqlcmd/sqlcmd-use-scripting-variables)

Cloudflare API documentation:

- [https://developers.cloudflare.com/api/](https://developers.cloudflare.com/api/)

---

## 16. Recommended first setup

For the current Cloudflare DNS workflow on macOS:

```bash
source ~/.zshrc

token_set cloudflare:dns
cf_use dns
cf_verify
cf_zones
cf_dns how-to-use-ai.com --full
```

For a SQL credential:

```bash
credential_set sql:production
credential_exists sql:production
```

Then execute one SQL command without leaving the credential loaded in the parent shell:

```bash
credential_exec \
  sql:production \
  SQLCMDUSER \
  SQLCMDPASSWORD \
  sqlcmd \
    -S sql.example.com \
    -d ApplicationDb \
    -Q 'SELECT @@VERSION'
```

That is the intended operating model: **store once, select explicitly, expose only when required, unload when finished**.
