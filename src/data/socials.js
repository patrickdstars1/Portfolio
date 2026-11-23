// Accounts whose follower counts are shown on the site and refreshed automatically.
// `tokenEnv` names the GitHub Actions secret that holds the API token for that account
// (see README: "Follower counts"). Without a token the account is simply not shown.
//
// platform: 'facebook' | 'instagram' | 'youtube' | 'tiktok'
//   facebook / instagram: `id` is the Page ID / Instagram business account ID, token = access token
//   youtube:              `id` is the channel ID (UC...), token = Data API key
//   tiktok:               `id` is unused, token = user access token with the user.info.stats scope
export const socialAccounts = [
  { key: 'abyss-facebook', name: 'Abyss Files', platform: 'facebook', id: '61595622583527', tokenEnv: 'FB_TOKEN_ABYSS' },
  { key: 'xeno-facebook', name: 'Xeno Atlas', platform: 'facebook', id: '61595514497855', tokenEnv: 'FB_TOKEN_XENO' },
]

export const platformLabel = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' }
