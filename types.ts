export type Application = {
  id: string;
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
  guild_id?: string;
  primary_sku_id?: string;
  slug?: string;
  cover_image?: string;
};

export type ApplicationCommand = {
  id: string;
  type: ApplicationCommandTypes;
  application_id: string;
  guild_id?: string;
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
  version: string;
};

export type CreateApplicationCommand = {
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
};

export type Localization = {
  [key: string]: string;
};

export type PermissionString = {
  id: string;
  type: PermissionType;
  permission: boolean;
};

export enum PermissionType {
  ROLE = 1,
  USER,
}

export enum ApplicationCommandTypes {
  ChatInput = 1,
  User,
  Message,
}

export type ApplicationCommandOption = {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  autocomplete?: boolean;
};

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
  NUMBER,
  ATTACHMENT,
}

export enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER,
  MESSAGE,
}

export type ApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};

export enum ComponentType {
  ActionRow = 1,
  Button,
  StringSelect,
  TextInput,
  UserSelect,
  RoleSelect,
  MentionableSelect,
  ChannelSelect,
}

/**An Action Row is a non-interactive container component for other types of components. */
export type ActionRow = {
  type: ComponentType.ActionRow;
  components: (Button | SelectMenu | TextInput)[];
};

export enum ButtonStyle {
  Primary = 1,
  Secondary,
  Success,
  Danger,
  Link,
}

export type Button = {
  type: ComponentType.Button;
  style: ButtonStyle;
  label?: string;
  emoji?: Emoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
};

export type SelectMenu = {
  type:
    | ComponentType.ChannelSelect
    | ComponentType.MentionableSelect
    | ComponentType.RoleSelect
    | ComponentType.StringSelect
    | ComponentType.UserSelect;
  custom_id: string;
  options: SelectMenuOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  channel_types?: ChannelType[];
};

export type SelectMenuOption = {
  label: string;
  value: string;
  description?: string;
  emoji?: Emoji;
  default?: boolean;
};

export type TextInput = {
  type: ComponentType.TextInput;
  custom_id: string;
  placeholder?: string;
  min_length?: number;
  max_length?: number;
};

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

export type Interaction<T = InteractionType> = {
  id: string;
  data: T extends InteractionType.APPLICATION_COMMAND ? ApplicationCommandData
    : T extends InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE
      ? Partial<ApplicationCommandData>
    : T extends InteractionType.MESSAGE_COMPONENT ? MessageComponentData
    : T extends InteractionType.MODAL_SUBMIT ? ModalSubmitData
    : never;
  type: T;
  application_id: string;
  guild_id?: string;
  channel_id?: string;
  member?: GuildMember;
  user?: DiscordUser;
  token: string;
  version: number;
  message?: Message;
};

/**This is sent on the message object when the message is a response to an Application Command Interaction without an existing message. */
export type MessageInteraction = {
  id: string;
  type: InteractionType.MESSAGE_COMPONENT;
  name: string;
  user: DiscordUser;
  member?: Partial<GuildMember>;
};

export type ApplicationCommandData = {
  id: string;
  name: string;
  type: ApplicationCommandType;
  resolved?: InteractionDataResolved;
  options?: ApplicationCommandInteractionDataOption[];
};

export type MessageComponentData = {
  custom_id: string;
  component_type: number;
  values?: string[];
};

export type ModalSubmitData = {
  custom_id: string;
  component_type: number;
  values?: string[];
};

export type InteractionDataResolved = {
  users?: DiscordUser[];
  members?: GuildMember[];
  roles?: DiscordRole[];
  channels?: Channel[];
};

export type ApplicationCommandInteractionDataOption = {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string | number | boolean;
  options?: ApplicationCommandInteractionDataOption[];
};

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

export type InteractionResponse = {
  type: InteractionResponseType;
  data?: InteractionResponseData;
};

export type InteractionResponseData = {
  tts?: boolean;
  content?: string;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  flags?: number;
  components?: ActionRow[];
  attachments?: Attachment[];
};

export type Embed = {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  video?: {
    url: string;
    height?: number;
    width?: number;
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
};

export type AllowedMentions = {
  parse?: string[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
};

export type Attachment = {
  id: string;
  filename: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
};

export type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
};

export type GuildMember = {
  user?: DiscordUser;
  nick?: string;
  roles: DiscordRole[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
};

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
};

export type Channel = {
  id: string;
  type: ChannelType;
  guild_id?: string;
  position?: number;
  permission_overwrites?: PermissionsOverwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  parent_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: ThreadMetadata;
  member?: ThreadMember;
  default_auto_archive_duration?: number;
};

export type PermissionsOverwrite = {
  id: string;
  type: number;
  allow: string;
  deny: string;
};

export type ThreadMetadata = {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked?: boolean;
};

export type ThreadMember = {
  id: string;
  user_id: string;
  join_timestamp: string;
  flags: number;
};

export type Emoji = {
  id?: string;
  name?: string;
  animated?: boolean;
};

export type Message = {
  id: string;
  channel_id: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: DiscordRole[];
  //mention_channels?: ChannelMention[];
  attachments: Attachment[];
  embeds: Embed[];
  //reactions?: Reaction[];
  nonce?: string;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  //activity?: MessageActivity;
  application?: Partial<Application>;
  application_id?: string;
  //message_reference?: MessageReference;
  flags?: number;
  referenced_message?: Message;
  interaction?: MessageInteraction;
  thread?: Channel;
  components?: ActionRow[];
  //sticker_items?: StickerItem[];
  //stickers?: Sticker[];
  position?: number;
};

export type CreateMessage = {
  content?: string;
  nonce?: string;
  tts?: boolean;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  //message_reference?: MessageReference;
  components?: ActionRow[];
  sticker_ids?: string[];
  files?: File[];
  attachments?: Attachment[];
  flags?: number;
};

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
