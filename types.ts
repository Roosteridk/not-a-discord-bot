export interface Application {
  id: bigint;
  name: string;
  icon: string | null;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: DiscordUser;
  verify_key: string;
  guild_id?: bigint;
  primary_sku_id?: bigint;
  slug?: string;
  cover_image?: string;
}

export interface ApplicationCommand {
  id: bigint;
  type: ApplicationCommandTypes;
  application_id: bigint;
  guild_id?: bigint;
  name: string;
  name_localizations?: Localization;
  description: string;
  description_localizations?: Localization;
  options?: ApplicationCommandOption[];
  dm_permission?: boolean;
  default_member_permissions?: PermissionString[];
  dm_member_permissions?: PermissionString[];
  default_permission?: boolean;
  nsfw?: boolean;
  /** Autoincrementing version identifier updated during substantial record changes */
  version: bigint;
}

export interface CreateApplicationCommand {
  name: string;
  /** Localization object for the `name` field. Values follow the same restrictions as `name` */
  nameLocalizations?: Localization;
  /** 1-100 character description */
  description: string;
  /** Localization object for the `description` field. Values follow the same restrictions as `description` */
  descriptionLocalizations?: Localization;
  /** Type of command, defaults `ApplicationCommandTypes.ChatInput` if not set  */
  type?: ApplicationCommandTypes;
  /** Parameters for the command */
  options?: ApplicationCommandOption[];
  /** Set of permissions represented as a bit set */
  defaultMemberPermissions?: PermissionString[];
  /** Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible. */
  dmPermission?: boolean;
}

export interface Localization {
  [key: string]: string;
}

export interface PermissionString {
  id: bigint;
  type: PermissionType;
  permission: boolean;
}

export enum PermissionType {
  ROLE = 1,
  USER,
}

export enum ApplicationCommandTypes {
  ChatInput = 1,
  User,
  Message,
}

export interface ApplicationCommandOption {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
  channel_types?: ChannelType[];
  min_value?: ComponentType;
  max_value?: ComponentType;
  autocomplete?: boolean;
}

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
  MENTIONABLE,
  ComponentType,
  ATTACHMENT,
}

export enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER,
  MESSAGE,
}

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | ComponentType;
}

/**An Action Row is a non-interactive container component for other types of components. */
export interface ActionRow {
  type: 1;
  components: (Button | SelectMenu | TextInput)[];
}

export interface Button {
  type: 2;
  style: ComponentType;
  label?: string;
  emoji?: Emoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface SelectMenu {
  type: 3;
  custom_id: string;
  options: SelectMenuOption[];
  placeholder?: string;
  min_values?: ComponentType;
  max_values?: ComponentType;
  disabled?: boolean;
  channel_types?: ChannelType[];
}

export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Emoji;
  default?: boolean;
}

export interface TextInput {
  type: 4;
  custom_id: string;
  placeholder?: string;
  min_length?: ComponentType;
  max_length?: ComponentType;
}

export enum ComponentType {
  ActionRow = 1,
  Button,
  SelectMenu,
  TextInput,
}

export enum ChannelType {
  GUILD_TEXT = 0,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_NEWS,
  GUILD_STORE,
  GUILD_NEWS_THREAD,
  GUILD_PUBLIC_THREAD,
  GUILD_PRIVATE_THREAD,
  GUILD_STAGE_VOICE,
}

export interface Interaction {
  id: bigint;
  application_id: bigint;
  type: InteractionType;
  data?: ApplicationCommandData | MessageComponentData | ModalSubmitData;
  guild_id?: bigint;
  channel_id?: bigint;
  member?: GuildMember;
  user?: DiscordUser;
  token: string;
  version: ComponentType;
  message?: Message;
}

export interface ApplicationCommandData {
  id: bigint;
  name: string;
  type: ApplicationCommandType;
  resolved?: InteractionDataResolved;
  options?: ApplicationCommandInteractionDataOption[];
}

export interface MessageComponentData {
  custom_id: string;
  component_type: ComponentType;
  values?: string[];
}

export interface ModalSubmitData {
  custom_id: string;
  component_type: ComponentType;
  values?: string[];
}

export interface InteractionDataResolved {
  users?: DiscordUser[];
  members?: GuildMember[];
  roles?: DiscordRole[];
  channels?: Channel[];
}

export interface ApplicationCommandInteractionDataOption {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string | ComponentType | boolean;
  options?: ApplicationCommandInteractionDataOption[];
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND,
  MESSAGE_COMPONENT,
  APPLICATION_COMMAND_AUTOCOMPLETE,
  MODAL_SUBMIT,
}

export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
  DEFERRED_UPDATE_MESSAGE,
  UPDATE_MESSAGE,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
  MODAL,
}

export interface InteractionResponse {
  type: InteractionResponseType;
  data?: InteractionResponseData;
}

export interface InteractionResponseData {
  tts?: boolean;
  content?: string;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  flags?: ComponentType;
  components?: ActionRow[];
  attachments?: Attachment[];
}

export interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: ComponentType;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: ComponentType;
    width?: ComponentType;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: ComponentType;
    width?: ComponentType;
  };
  video?: {
    url: string;
    height?: ComponentType;
    width?: ComponentType;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

export interface AllowedMentions {
  parse?: string[];
  roles?: bigint[];
  users?: bigint[];
  replied_user?: boolean;
}

export interface Attachment {
  id: bigint;
  filename: string;
  content_type?: string;
  size: ComponentType;
  url: string;
  proxy_url: string;
  height?: ComponentType;
  width?: ComponentType;
}

export interface DiscordUser {
  id: bigint;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: ComponentType;
  premium_type?: ComponentType;
  public_flags?: ComponentType;
}

export interface GuildMember {
  user?: DiscordUser;
  nick?: string;
  roles: DiscordRole[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

export interface DiscordRole {
  id: bigint;
  name: string;
  color: ComponentType;
  hoist: boolean;
  position: ComponentType;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface Channel {
  id: bigint;
  type: ChannelType;
  guild_id?: bigint;
  position?: ComponentType;
  permission_overwrites?: PermissionsOverwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: bigint;
  bitrate?: ComponentType;
  user_limit?: ComponentType;
  rate_limit_per_user?: ComponentType;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: bigint;
  application_id?: bigint;
  parent_id?: bigint;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: ComponentType;
  message_count?: ComponentType;
  member_count?: ComponentType;
  thread_metadata?: ThreadMetadata;
  member?: ThreadMember;
  default_auto_archive_duration?: ComponentType;
}

export interface PermissionsOverwrite {
  id: bigint;
  type: ComponentType;
  allow: string;
  deny: string;
}

export interface ThreadMetadata {
  archived: boolean;
  auto_archive_duration: ComponentType;
  archive_timestamp: string;
  locked?: boolean;
}

export interface ThreadMember {
  id: bigint;
  user_id: bigint;
  join_timestamp: string;
  flags: ComponentType;
}

export interface Emoji {
  id?: bigint;
  name?: string;
  animated?: boolean;
}

export interface Message {
  id: bigint;
  channel_id: bigint;
  guild_id?: bigint;
}

export enum MessageFlags {
  CROSSPOSTED = 1 << 0,
  IS_CROSSPOST = 1 << 1,
  SUPPRESS_EMBEDS = 1 << 2,
  SOURCE_MESSAGE_DELETED = 1 << 3,
  URGENT = 1 << 4,
  HAS_THREAD = 1 << 5,
  EPHEMERAL = 1 << 6,
  LOADING = 1 << 7,
}
