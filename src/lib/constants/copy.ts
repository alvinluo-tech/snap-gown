/**
 * 全站统一中文文案字典
 * 所有前端页面和后端通知中的文本必须通过此文件引用
 * 按模块分组，严禁在组件中硬编码中文文本
 */

export const COPY = {
  // ============================================================
  // 品牌 & 通用
  // ============================================================
  BRAND: {
    NAME: "SnapGown",
    TAGLINE: "预约你的毕业照拍摄",
    DESCRIPTION: "在杜伦大学找到专业摄影师。选择时间段，通过微信支付，获得精美的毕业照。",
    META_TITLE: "SnapGown - 英国毕业照拍摄预约",
    META_DESC: "在英国大学预约专业毕业照拍摄服务",
  },

  COMMON: {
    LOGIN: "登录",
    GET_STARTED: "立即注册",
    DASHBOARD: "控制台",
    ADMIN: "管理后台",
    LOGOUT: "退出登录",
    LOADING: "加载中...",
    NO_DATA: "暂无数据",
    CONFIRM: "确认",
    CANCEL: "取消",
    SUBMIT: "提交",
    SAVE: "保存",
    DELETE: "删除",
    EDIT: "编辑",
    SEARCH: "搜索...",
    BACK: "返回",
    VIEW_ALL: "查看全部",
    VIEW_DETAILS: "查看详情",
    ACTIONS: "操作",
    STATUS: "状态",
    AMOUNT: "金额",
    DATE: "日期",
    TIME: "时间",
    NAME: "姓名",
    PHONE: "电话",
    WECHAT: "微信",
    PHOTOGRAPHER: "摄影师",
    STUDENT: "学生",
    ORDER: "订单",
    PROOF: "凭证",
    FAILED: "操作失败",
    CREATING: "创建中...",
    UPDATING: "更新中...",
    CANCELLING: "取消中...",
  },

  // ============================================================
  // 首页
  // ============================================================
  HOME: {
    HERO_TITLE: "预约你的毕业照拍摄",
    HERO_SUBTITLE: "在杜伦大学找到专业摄影师。选择时间段，通过微信支付，获得精美的毕业照。",
    LOCATION: "杜伦大学",
    INSTANT_BOOKING: "即时预约",
    WECHAT_PAYMENT: "微信支付",
    AVAILABLE_PHOTOGRAPHERS: "可用摄影师",
    NO_PHOTOGRAPHERS: "暂无可用摄影师，请稍后再来！",
    VIEW_SLOTS_BOOK: "查看档期 & 预约",
    WELCOME_BACK: (name: string) => `欢迎回来，${name}！`,
    PHOTOGRAPHER_SUBTITLE: "管理你的预约和可用档期，开始接受毕业照拍摄请求。",
    ACTIVE_SLOTS: "个可用档期",
    PENDING_ORDERS: "个待处理订单",
    MANAGE_ORDERS: "管理订单",
    MANAGE_ORDERS_DESC: "查看和管理来自学生的预约请求。",
    MANAGE_AVAILABILITY: "管理可用档期",
    MANAGE_AVAILABILITY_DESC: "设置你的可用时间段供学生预约。",
    ADMIN_DASHBOARD: "管理员控制台",
    ADMIN_SUBTITLE: "管理摄影师、订单和平台设置。",
    PHOTOGRAPHERS: "摄影师",
    PHOTOGRAPHERS_DESC: "审核和批准摄影师申请。",
    MANAGE_PHOTOGRAPHERS: "管理摄影师",
    ORDERS: "订单",
    ORDERS_DESC: "查看和管理平台上的所有订单。",
    VIEW_ORDERS: "查看订单",
    ADMIN_PANEL: "管理面板",
    ADMIN_PANEL_DESC: "访问完整的管理后台和数据分析。",
    OPEN_ADMIN_PANEL: "打开管理面板",
    PHOTOGRAPHER_BADGE: "摄影师",
  },

  // ============================================================
  // 支付 & 结算
  // ============================================================
  CHECKOUT: {
    TITLE: "结算",
    PAYMENT_TITLE: "支付",
    WECHAT_PAY_INSTRUCTION: (rmb: string, gbp: string) =>
      `请扫描下方微信二维码支付共计 ¥${rmb} 元（折合 £${gbp}）`,
    REF_CODE_WARNING: "【极重要警告】请务必在微信转账的【添加备注/说明】中填写此参考码：",
    REF_CODE_CONSEQUENCE: "否则摄影师将无法为您确认档期！",
    PAYMENT_WINDOW: "30分钟支付窗口",
    PAYMENT_WINDOW_DESC: (rmb: string) =>
      `请在 30 分钟内通过微信向摄影师转账 ¥${rmb}，然后上传付款截图。`,
    UPLOAD_PROOF: "上传付款凭证",
    PROOF_SUBMITTED: "付款凭证已提交",
    PROOF_SUBMITTED_DESC: "摄影师有 12 小时来确认你的付款。确认后你会收到通知。",
    BOOKING_CONFIRMED: "预约已确认！",
    BOOKING_CONFIRMED_DESC: (date: string) => `你的毕业照拍摄已确认。${date} 见！`,
    PAY_NOW: "立即支付",
    ORDER_NUMBER: "订单号",
    PAYMENT_REF: "支付参考码",
    PHOTOGRAPHER_LABEL: "摄影师",
    TOTAL: "总计",
    BOOKING_DETAILS: "预约详情",
    CANCEL_BOOKING: "取消预约",
    BOOKING_CANCELLED: "预约已取消",
    CANCEL_FAILED: "取消失败",
    WECHAT_PAYMENT_TITLE: "微信支付",
    WECHAT_PAYMENT_SCAN: (name: string) => `扫描下方二维码向 ${name} 付款`,
    QR_NOT_UPLOADED: "摄影师尚未上传收款二维码。",
    CONTACT_VIA_WECHAT: "微信联系：",
    PROOF_UPLOAD_TITLE: "上传付款凭证",
    PROOF_UPLOAD_DESC: "上传微信支付截图作为付款凭证",
    PROOF_PREVIEW_ALT: "付款凭证预览",
    SUBMITTING: "提交中...",
    SUBMIT_PROOF: "提交付款凭证",
  },

  // ============================================================
  // 学生控制台
  // ============================================================
  STUDENT: {
    MY_BOOKINGS: "我的预约",
    BOOKING_HISTORY: "预约历史",
    NO_BOOKINGS: "暂无预约。",
    BROWSE_PHOTOGRAPHERS: "浏览摄影师",
    PROOF_SUBMITTED_NOTICE: "您的付款凭证已成功提交。当前档期已为您安全锁定。摄影师正为您核对账单中（最长不超过12小时）。若超时未处理，平台官方客服将直接介入协助，请您放心。",
    VIEW_BOOKINGS: "查看预约",
    LOGIN_TO_VIEW: "请登录查看你的预约。",
    ORDER_NO: "订单号",
    PAYMENT_REF: "支付参考码",
    PHOTOGRAPHER: "摄影师",
    DATE: "日期",
    TIME: "时间",
    AMOUNT: "金额",
    STATUS: "状态",
    ACTION: "操作",
    PAY_NOW: "立即支付",
  },

  // ============================================================
  // 摄影师控制台
  // ============================================================
  PHOTOGRAPHER_DASHBOARD: {
    TITLE: "摄影师控制台",
    MANAGE_SLOTS: "管理档期",
    ORDER_MANAGEMENT: "订单管理",
    NO_ORDERS: "暂无订单。创建可用档期开始接收预约！",
    CONFIRM_PAYMENT: "确认",
    REJECT_PAYMENT: "拒绝",
    MARK_COMPLETE: "标记完成",
    VIEW_PROOF: "查看凭证",
    ORDER: "订单",
    PAYMENT_REF: "支付参考码",
    STUDENT: "学生",
    DATE: "日期",
    AMOUNT: "金额",
    STATUS: "状态",
    PROOF: "凭证",
    ACTIONS: "操作",
    DEBT_WARNING: "欠款警告",
    ACCOUNT_SUSPENDED: "账户已暂停",
    OUTSTANDING_COMMISSION: "待付佣金",
    SUSPENDED_MESSAGE: "你的账户已被暂停。请联系管理员结算佣金。",
    COMMISSION_MESSAGE: "请与平台结算佣金。",
    LOGIN_TO_VIEW: "请登录查看你的订单。",
    LOGIN_TO_VIEW_SLOTS: "请登录查看你的档期。",
    REJECT_DIALOG_TITLE: "拒绝付款",
    REJECT_DIALOG_DESC: "请提供拒绝付款凭证的原因。",
    REJECT_REASON_PLACEHOLDER: "拒绝原因...",
    REJECT_AND_RELEASE: "拒绝并释放",
    PAYMENT_CONFIRMED: "付款已确认！预约现已生效。",
    CONFIRM_FAILED: "确认失败",
    ORDER_COMPLETED: "订单已标记为完成！",
    COMPLETE_FAILED: "完成失败",
    PAYMENT_REJECTED: "付款已拒绝。学生将收到通知。",
    REJECT_FAILED: "拒绝失败",
    WECHAT_LABEL: "微信：",
    // 档期管理
    CREATE_SLOTS_TITLE: "创建时间段",
    CREATE_SLOTS_DESC: "添加可用时间段供学生预约",
    SINGLE_SLOT: "单个创建",
    BATCH_CREATE: "批量创建",
    START_TIME: "开始时间",
    END_TIME: "结束时间",
    START_DATE: "开始日期",
    END_DATE: "结束日期",
    CREATE_SLOT: "创建时间段",
    BATCH_CREATE_SLOTS: "批量创建时间段",
    YOUR_SLOTS: "你的时间段",
    SLOT_CREATED: "时间段已创建！",
    SLOT_CREATE_FAILED: "创建时间段失败",
    SLOTS_BATCH_CREATED: (count: number) => `已创建 ${count} 个时间段！`,
    BATCH_CREATE_FAILED: "批量创建失败",
    SLOT_PRICE: "档期价格 (£)",
    SLOT_DELETED: "时间段已删除",
    SLOT_DELETE_FAILED: "删除失败",
  },

  // ============================================================
  // 管理员控制台
  // ============================================================
  ADMIN: {
    OVERVIEW: "概览",
    ORDERS: "订单",
    PHOTOGRAPHERS: "摄影师",
    COMMISSION: "佣金",
    STUDENTS: "学生",
    PLATFORM_OVERVIEW: "平台概览",
    FAILED_TO_LOAD: "加载管理员数据失败。请确认你以管理员身份登录。",
    PENDING_PAYMENT: "待支付",
    AWAITING_VERIFICATION: "待审核",
    CONFIRMED: "已确认",
    OVERDUE: "已超期",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
    COMMISSION_OWED: "待付佣金",
    PENDING_APPROVALS: "待审核",
    TOTAL_STUDENTS: "总学生数",
    TOTAL_PHOTOGRAPHERS: "总摄影师数",
    RECENT_ORDERS: "最近订单",
    PENDING_PHOTOGRAPHERS: "待审核摄影师",
    NO_ORDERS_YET: "暂无订单。",
    NO_PENDING_APPROVALS: "暂无待审核申请。",
    REVIEW: "审核",
    REVIEW_NOW: "立即审核",
    PENDING_APPROVAL: "待审核",
    NO_PHOTOGRAPHERS_PENDING: "暂无待审核的摄影师。",
    ALL_PHOTOGRAPHERS: "所有摄影师",
    NO_PHOTOGRAPHERS_REGISTERED: "暂无注册摄影师。",
    NO_PHOTOGRAPHERS_MATCH: "没有匹配搜索的摄影师。",
    APPROVE: "批准",
    REJECT: "拒绝",
    SUSPEND: "暂停",
    UNSUSPEND: "恢复",
    CLEAR_DEBT: "清除欠款",
    APPROVAL: "审核状态",
    ACCOUNT: "账户状态",
    DEBT: "欠款",
    SUSPEND_DIALOG_TITLE: "暂停摄影师？",
    SUSPEND_DIALOG_DESC: "这将阻止摄影师接收新的预约。",
    UNSUSPEND_DIALOG_TITLE: "恢复摄影师？",
    UNSUSPEND_DIALOG_DESC: "这将恢复摄影师接收预约的能力。",
    CLEAR_DEBT_DIALOG_TITLE: "清除欠款？",
    CLEAR_DEBT_DIALOG_DESC: "这将把摄影师的佣金欠款设为 £0.00 并恢复其账户。",
    PHOTOGRAPHER_APPROVED: "摄影师已批准",
    PHOTOGRAPHER_REJECTED: "摄影师已拒绝",
    ACCOUNT_SUSPENDED: "账户已暂停",
    ACCOUNT_REACTIVATED: "账户已恢复",
    DEBT_CLEARED: "欠款已清除，账户已恢复",
    SEARCH_PHOTOGRAPHERS: "按姓名或微信搜索...",
    SEARCH_ORDERS: "按订单号、支付参考码、学生或摄影师搜索...",
    FILTER_BY_STATUS: "按状态筛选",
    ALL_STATUSES: "所有状态",
    URGENT_ORDERS: "紧急订单（需要处理）",
    ALL_ORDERS: "所有订单",
    REJECT_ORDER: "拒绝订单",
    REJECT_ORDER_DESC: "这将取消订单并释放档期。请提供原因。",
    REJECT_REASON_PLACEHOLDER: "拒绝原因...",
    REJECT_AND_RELEASE: "拒绝并释放",
    ORDER_CONFIRMED: "订单已由管理员确认",
    ORDER_REJECTED: "订单已拒绝，档期已释放",
    PAYMENT_PROOF: "付款凭证",
    // 佣金
    COMMISSION_LEDGER: "佣金账本",
    PENDING: "待处理",
    SETTLED: "已结算",
    WAIVED: "已免除",
    TOTAL_ENTRIES: "总条目数",
    SEARCH_COMMISSION: "按摄影师或订单号搜索...",
    NO_ENTRIES_MATCH: "没有匹配筛选的条目。",
    NO_ENTRIES_YET: "暂无佣金条目。",
    ORDER_AMOUNT: "订单金额",
    COMMISSION_AMOUNT: "佣金",
    SETTLE: "结算",
    WAIVE: "免除",
    SETTLED_ON: "结算于",
    SETTLE_DIALOG_TITLE: "标记为已结算？",
    SETTLE_DIALOG_DESC: "这将标记佣金为已支付。此操作应在确认收款后进行。",
    WAIVE_DIALOG_TITLE: "免除佣金？",
    WAIVE_DIALOG_DESC: "这将免除此佣金并减少摄影师的欠款。确定吗？",
    COMMISSION_SETTLED: "佣金已标记为已结算",
    COMMISSION_WAIVED: "佣金已免除",
    // 学生
    STUDENTS_TITLE: "学生",
    SEARCH_STUDENTS: "按姓名、微信或电话搜索...",
    NO_STUDENTS_MATCH: "没有匹配搜索的学生。",
    NO_STUDENTS_REGISTERED: "暂无注册学生。",
    ORDERS_COUNT: "订单数",
    TOTAL_SPENT: "总消费",
    LAST_ACTIVE: "最后活跃",
    TOTAL_REVENUE: "总收入",
    COMMISSION_ENTRIES: (count: number) => `佣金条目 (${count})`,
  },

  // ============================================================
  // 摄影师公共页面
  // ============================================================
  PHOTOGRAPHER_PAGE: {
    AVAILABLE_SLOTS: "可用时间段",
    RESERVING: "正在为你保留档期...",
    VIEW_SLOTS: "查看档期 & 预约",
    BOOK_NOW: "立即预约",
    CONTACT_WECHAT: "微信联系",
    SLOT_RESERVED: "档期已锁定！请在 30 分钟内完成支付。",
    BOOKING_FAILED: "预约失败",
    PRICE_LABEL: "价格：",
    PAYMENT_VIA_WECHAT: "通过微信支付",
    FROM_PRICE: (price: string) => `从 £${price} 起`,
  },

  // ============================================================
  // 个人资料
  // ============================================================
  PROFILE: {
    TITLE: "个人资料",
    EDIT_PROFILE: "编辑资料",
    SAVE_PROFILE: "保存资料",
    PROFILE_UPDATED: "个人资料已更新",
    PROFILE_UPDATE_FAILED: "更新失败",
    AVATAR_UPLOAD_SUCCESS: "头像上传成功",
    AVATAR_UPLOAD_FAILED: "头像上传失败",
    WECHAT_QR_UPLOAD_SUCCESS: "微信收款码上传成功",
    WECHAT_QR_UPLOAD_FAILED: "上传失败",
    FULL_NAME_LABEL: "姓名",
    BIO_LABEL: "个人简介",
    BIO_PLACEHOLDER: "介绍一下你的摄影风格和经验...",
    WECHAT_ID_LABEL: "微信 ID",
    UK_PHONE_LABEL: "英国手机号（选填）",
    GOWNS_LABEL: "学士服信息",
    ADD_GOWN: "添加学士服",
    REMOVE_GOWN: "移除",
    DEGREE_LABEL: "学位",
    SIZE_LABEL: "尺码",
    SLUG_LABEL: "个人主页链接",
    WECHAT_QR_LABEL: "微信收款码",
    WECHAT_QR_HINT: "学生扫码付款时使用",
    AVATAR_LABEL: "头像",
    AVATAR_HINT: "支持 JPG/PNG，最大 2MB",
    WECHAT_QR_MAX_SIZE: "支持 JPG/PNG，最大 5MB",
  },

  // ============================================================
  // 认证
  // ============================================================
  AUTH: {
    LOGIN_TITLE: "登录",
    REGISTER_TITLE: "注册",
    EMAIL: "邮箱",
    PASSWORD: "密码",
    CONFIRM_PASSWORD: "确认密码",
    FORGOT_PASSWORD: "忘记密码？",
    RESET_PASSWORD: "重置密码",
    RESET_PASSWORD_TITLE: "重置密码",
    RESET_PASSWORD_DESC: "输入你注册时使用的邮箱，我们将发送重置链接。",
    SEND_RESET_LINK: "发送重置链接",
    SENDING: "发送中...",
    CHECK_EMAIL: "查看邮箱",
    CHECK_EMAIL_DESC: (email: string) => `我们已向 ${email} 发送了验证链接。`,
    NEXT_STEPS: "后续步骤：",
    STEP_1: "打开你的邮箱",
    STEP_2: "点击验证链接",
    STEP_3: "返回此处登录",
    EMAIL_SENT: "邮件已发送",
    EMAIL_SENT_DESC: (email: string) =>
      `如果存在 ${email} 的账户，你将很快收到密码重置链接。`,
    PASSWORD_UPDATED: "密码已更新",
    PASSWORD_UPDATED_DESC: "你的密码已成功更改。",
    REDIRECTING: (countdown: number) => `将在 ${countdown} 秒后跳转到登录...`,
    GO_TO_LOGIN: "立即跳转登录",
    BACK_TO_LOGIN: "返回登录",
    PASSWORD_STRENGTH: {
      WEAK: "弱",
      FAIR: "一般",
      GOOD: "良好",
      STRONG: "强",
    },
    ROLE_STUDENT: "学生",
    ROLE_PHOTOGRAPHER: "摄影师",
    STEP_1_TITLE: "选择角色",
    STEP_2_TITLE: "完善信息",
    I_AM_A: "我是",
    FULL_NAME: "姓名",
    FULL_NAME_PLACEHOLDER: "张三",
    EMAIL_PLACEHOLDER: "your@email.com",
    PASSWORD_PLACEHOLDER: "至少 6 位密码",
    CUSTOM_PROFILE_URL: "自定义主页链接",
    CUSTOM_PROFILE_URL_PLACEHOLDER: "alvin",
    CUSTOM_PROFILE_URL_HINT: "例如 alvin，你的主页将是 /photographers/alvin",
    ALREADY_REGISTERED: "此邮箱已注册。请直接登录。",
    REGISTRATION_SUCCESS: "注册成功！",
    REGISTRATION_SUCCESS_DESC: "请查看邮箱完成验证。",
    RESEND_EMAIL: "重发邮件",
    LOGIN_SUCCESS: "登录成功",
    PASSWORDS_NOT_MATCH: "两次输入的密码不一致",
    PASSWORD_MIN_LENGTH: "密码至少需要 6 个字符",
    SIGNING_IN: "登录中...",
    SIGN_IN: "登录",
    CREATING_ACCOUNT: "创建中...",
    CREATE_ACCOUNT: "创建账号",
    ACCOUNT_STEP: "账号",
    DETAILS_STEP: "详情",
    WECHAT_ID: "微信 ID",
    WECHAT_ID_PLACEHOLDER: "your_wechat_id",
    WECHAT_ID_HINT_ROLE: (role: string) =>
      `用于与${role}进行支付沟通`,
    UK_PHONE: "英国手机号（选填）",
    UK_PHONE_PLACEHOLDER: "+44 7xxx xxx xxx",
    RE_ENTER_PASSWORD: "再次输入密码",
    PASSWORDS_MATCH: "密码一致",
    REVIEW_INFO: "确认信息",
    VERIFICATION_EMAIL_RESENT: "验证邮件已重发！",
    DIDNT_RECEIVE_EMAIL: "没收到邮件？请检查垃圾邮件文件夹或",
    EMAIL_PLACEHOLDER2: "you@example.com",
    SET_NEW_PASSWORD: "设置新密码",
    NEW_PASSWORD: "新密码",
    UPDATING: "更新中...",
    UPDATE_PASSWORD: "更新密码",
    ENTER_EMAIL_FOR_RESET: "输入你注册时使用的邮箱，我们将发送密码重置链接。",
  },

  // ============================================================
  // 邮件模板
  // ============================================================
  EMAIL: {
    PAYMENT_NOTIFICATION_TITLE: "新的付款凭证待审核",
    PAYMENT_NOTIFICATION_BODY: "学生已上传付款凭证，请及时审核。",
    OVERDUE_ALERT_TITLE: "订单审核超时提醒",
    OVERDUE_ALERT_BODY: "以下订单已超过 12 小时未审核，请及时处理。",
    SUSPENSION_NOTICE_TITLE: "账户暂停通知",
    SUSPENSION_NOTICE_BODY: "由于佣金欠款超过阈值，你的账户已被暂停。",
    VIEW_ORDER: "查看订单",
    CONTACT_SUPPORT: "联系客服",
  },

  // ============================================================
  // 通用组件
  // ============================================================
  COMPONENTS: {
    // ProofUploader
    UPLOAD_IMAGE_ONLY: "请上传图片文件",
    PROOF_UPLOADED: "付款凭证上传成功！",
    PROOF_UPLOAD_FAILED: "上传失败",
    PROOF_UPLOADED_WAITING: "付款凭证已上传，等待摄影师确认。",
    DRAG_DROP_HINT: "拖拽微信支付截图到此处",
    OR_CLICK_SELECT: "或点击选择文件",
    SELECT_FILE: "选择文件",
    SUBMITTING_PROOF: "上传中...",
    SUBMIT_PROOF: "提交付款凭证",
    PROOF_PREVIEW_ALT: "付款凭证预览",
    // CalendarScheduler
    SELECT_DATE: "选择日期",
    NO_SLOTS_DATE: "该日期暂无可用时间段。",
    BOOK_NOW: "立即预约",
    DELETE_SLOT: "删除",
    // LogoutButton
    LOGOUT_TITLE: "退出登录",
    // Dialog
    CLOSE: "关闭",
  },

  // ============================================================
  // 法务合规 & 免责声明
  // ============================================================
  LEGAL: {
    // 平台免责声明
    DISCLAIMER_CHECKBOX_CN: "我已阅读并同意以上《平台免责声明及预约须知》，并确认本次付款将直接支付给摄影师本人，平台不代收、不托管、不分账、不处理该笔款项。",
    DISCLAIMER_CHECKBOX_EN: "I have read and agree to the Platform Disclaimer and Booking Notice above. I confirm that my payment will be made directly to the photographer, and that the platform does not collect, hold, split, process or transfer this payment.",
  },
} as const;

// ============================================================
// 平台免责声明与法务合规常量（独立导出）
// 用于前端 UI 渲染（收银台、规则页等）
// ============================================================

export const DISCLAIMER_CN = `# 平台免责声明及预约须知

请在预约并付款前仔细阅读以下内容。勾选即代表你已理解并同意本平台的服务边界、付款方式及相关风险提示。

## 1. 平台角色说明

本平台仅为毕业照约拍提供**信息展示、摄影师档期发布、预约撮合、订单记录与基础沟通辅助服务**。

本平台并非摄影服务的实际提供方，也不是摄影师或学生任何一方的雇主、代理人、合伙人、收款方、支付服务提供商、托管方或担保方。

摄影服务由入驻摄影师独立提供。学生与摄影师之间就拍摄时间、地点、套餐内容、交付标准、改期、退款及售后等事项形成直接服务关系。

## 2. 付款方式说明

你理解并同意：

1. 本平台不收取、接收、持有、托管、转移、处理或代付任何学生支付给摄影师的款项。
2. 所有摄影服务费用均由你通过摄影师展示的个人微信收款码，直接支付至摄影师本人账户。
3. 本平台不会代表摄影师收款，也不会代表学生向摄影师付款。
4. 付款截图仅用于预约核对、订单状态确认和争议记录，不代表平台已收款或平台承担付款处理责任。
5. 如涉及退款，退款应由摄影师与你直接协商并通过双方确认的方式完成。本平台可在合理范围内协助沟通，但不承担代收、代付、垫付或强制退款义务。

## 3. 非支付中介声明

本平台不提供以下服务：

* 不提供支付账户、电子钱包或资金储值服务；
* 不提供收款、清算、结算、分账或跨境汇款服务；
* 不提供外汇兑换、人民币/英镑换汇或汇率保证服务；
* 不控制学生付款资金的流向；
* 不在学生与摄影师之间转移任何资金；
* 不作为 escrow、trustee、payment agent、settlement agent 或 payment intermediary。

你向摄影师付款的行为，是你与摄影师之间的直接交易行为。付款完成后产生的到账核对、退款、服务争议或民事纠纷，应首先由你与摄影师直接沟通解决。

## 4. 服务责任边界

本平台会尽合理努力对摄影师资料、档期信息、作品展示和订单状态进行基础管理，但平台无法保证：

* 摄影师作品风格完全符合你的主观审美；
* 天气、场地、人流、学校管理、交通或突发事件不影响拍摄；
* 摄影师与你之间的沟通、服务履约或售后处理不存在任何争议；
* 微信支付、银行、汇率、账户限制或第三方支付系统不会出现异常。

在法律允许的最大范围内，本平台不对摄影师独立提供服务过程中产生的服务质量争议、退款争议、延迟交付、学生个人行程损失、服装道具准备成本、交通成本、误工损失或其他间接损失承担连带责任。

但本条不排除或限制平台在适用法律下不得排除的责任，包括欺诈、故意不当行为、重大过失或法律规定不可排除的消费者权利。

## 5. 学生下单确认

勾选本声明即表示你确认：

* 你已查看摄影师套餐、价格、拍摄日期、拍摄时长、交付内容、改期/退款规则；
* 你理解付款对象为摄影师本人，而非本平台；
* 你理解平台不持有你的付款资金；
* 你同意上传付款截图用于摄影师核对到账；
* 你同意如发生天气、改期、退款或服务争议，应优先按照平台展示的规则与摄影师协商处理；
* 你理解平台可在争议中提供沟通记录、订单记录与基础协调，但不等同于平台成为交易一方或资金责任方。

---

**勾选框文案：**

> 我已阅读并同意以上《平台免责声明及预约须知》，并确认本次付款将直接支付给摄影师本人，平台不代收、不托管、不分账、不处理该笔款项。`;

export const DISCLAIMER_EN = `# Platform Disclaimer and Booking Notice

Please read the following terms carefully before making a booking and payment. By ticking the box, you confirm that you understand and agree to the role of the platform, the payment arrangement and the relevant risk notices.

## 1. Role of the Platform

This platform only provides information listing, photographer availability display, booking facilitation, order record management and basic communication support for graduation photo sessions.

The platform is not the actual provider of the photography service. The platform is not the employer, agent, partner, payee, payment service provider, escrow provider, trustee or guarantor of either the student or the photographer.

The photography service is independently provided by the photographer. The service relationship regarding shooting time, location, package content, delivery standard, rescheduling, refund and after-sales matters is directly formed between the student and the photographer.

## 2. Payment Arrangement

You understand and agree that:

1. The platform does not collect, receive, hold, safeguard, transfer, process or pay out any money paid by students to photographers.
2. All photography service fees are paid directly by you to the photographer's own WeChat account by scanning the photographer's personal WeChat payment QR code.
3. The platform does not collect payment on behalf of the photographer and does not make payment on behalf of the student.
4. The uploaded payment screenshot is used only for booking verification, order status confirmation and dispute record purposes. It does not mean that the platform has received the payment or is responsible for processing the payment.
5. Any refund should be handled directly between you and the photographer through a method agreed by both parties. The platform may provide reasonable communication support, but it does not undertake any obligation to collect, pay, advance, hold or forcibly refund any money.

## 3. No Payment Intermediary Statement

The platform does not provide:

* payment accounts, e-wallets or stored value services;
* payment collection, clearing, settlement, split payment or remittance services;
* foreign exchange, RMB/GBP exchange or exchange rate guarantee services;
* control over the flow of student payment funds;
* transfer of money between students and photographers;
* escrow, trustee, payment agent, settlement agent or payment intermediary services.

Your payment to the photographer is a direct transaction between you and the photographer. Any issue relating to payment confirmation, refund, service dispute or civil claim should first be resolved directly between you and the photographer.

## 4. Limitation of Platform Responsibility

The platform will use reasonable efforts to manage photographer profiles, availability information, portfolio display and order status. However, the platform cannot guarantee that:

* the photographer's style will fully match your personal preference;
* weather, venue conditions, crowds, university restrictions, transport or unexpected incidents will not affect the shoot;
* there will be no dispute between you and the photographer regarding communication, performance or after-sales matters;
* WeChat Pay, banks, exchange rates, account restrictions or third-party payment systems will not experience issues.

To the fullest extent permitted by law, the platform shall not be jointly liable for service quality disputes, refund disputes, delayed delivery, personal travel losses, outfit or prop preparation costs, transport costs, loss of time or other indirect losses arising from services independently provided by photographers.

Nothing in this disclaimer excludes or limits any liability that cannot be excluded under applicable law, including fraud, wilful misconduct, gross negligence or non-excludable statutory consumer rights.

## 5. Student Confirmation

By ticking the box, you confirm that:

* you have reviewed the photographer's package, price, shooting date, shooting duration, deliverables and rescheduling/refund rules;
* you understand that the payment is made directly to the photographer, not to the platform;
* you understand that the platform does not hold your payment funds;
* you agree to upload your payment screenshot for the photographer to verify receipt;
* you agree that any weather, rescheduling, refund or service dispute should first be handled with the photographer according to the rules displayed on the platform;
* you understand that the platform may provide order records, communication records and basic coordination support, but this does not make the platform a party to the transaction or responsible for the funds.

---

**Checkbox wording:**

> I have read and agree to the Platform Disclaimer and Booking Notice above. I confirm that my payment will be made directly to the photographer, and that the platform does not collect, hold, split, process or transfer this payment.`;

// ============================================================
// 英伦天气与改期/退款标准协议 (Weather & Reschedule Policy)
// ============================================================

export const WEATHER_POLICY_CN = `# 英伦天气与改期/退款标准协议

英国天气多变，尤其杜伦春夏毕业季常出现阵雨、大风、阴天与短时天气突变。为了尽量保障学生的拍摄体验，也尊重摄影师的档期、交通和服装准备成本，平台制定以下统一天气与改期/退款规则。

本规则适用于所有通过本平台预约的毕业照拍摄订单。学生完成预约即视为已阅读并同意本规则。

---

## 1. 天气判断标准

平台建议以以下信息作为天气判断依据：

1. **Met Office 英国气象局天气预警**
   包括 Yellow / Amber / Red warning，适用于 Durham / County Durham 或拍摄地所在区域。

2. **拍摄当天实际天气状况**
   包括持续性降雨、大风、雷电、极端低温、积雪、结冰、严重雾天等明显影响安全或成片质量的情况。

3. **双方沟通记录**
   学生与摄影师应尽量在平台订单页或平台认可的沟通渠道内确认是否改期，以便保留记录。

---

## 2. 可免费改期的恶劣天气情形

出现以下任一情况，学生或摄影师均可申请**免费改期一次**：

### A. 官方天气预警

拍摄时间前后 6 小时内，拍摄地所在区域出现以下预警：

* Met Office Amber Warning；
* Met Office Red Warning；
* 明确影响户外拍摄安全的 Yellow Warning，例如暴雨、雷暴、大风、冰雪或严重雾天。

### B. 实际天气明显影响拍摄

即使未发布官方预警，但出现以下实际情况，也可视为恶劣天气：

* 持续性中到大雨，明显影响妆造、服装和设备；
* 雷电天气；
* 强风导致学士服、头发、道具难以控制；
* 地面湿滑、积水、结冰，存在安全风险；
* 能见度过低，明显影响拍摄效果；
* 摄影师判断继续拍摄可能损害设备安全或人身安全。

### C. 学校或场地临时限制

如因天气导致学校建筑、草坪、桥梁、城堡、学院区域或其他拍摄点临时封闭，且明显影响原定拍摄方案，双方可协商免费改期。

---

## 3. 天气确认时间

为了避免临时反复变动，平台建议采用"两次确认制"：

### 第一次确认：拍摄前 24 小时

摄影师可根据天气预报与学生沟通是否存在改期风险。

此阶段仅作为提醒，不作为最终取消依据。

### 第二次确认：拍摄前 6 小时

拍摄前 6 小时内，以 Met Office 预警、实际天气变化和双方沟通为准，决定是否免费改期。

如恶劣天气在拍摄前 6 小时内突然出现，双方仍可根据实际情况启动免费改期。

---

## 4. 免费改期规则

1. 因恶劣天气导致无法正常拍摄的，学生享有一次免费改期机会。
2. 摄影师应尽量提供不少于 2 个可选新档期。
3. 学生应在收到新档期后 48 小时内确认。
4. 免费改期原则上应安排在原拍摄日后 30 天内，或毕业季可拍摄周期内。
5. 如学生因个人行程无法接受摄影师提供的合理新档期，可进入退款流程。
6. 如摄影师无法提供任何合理新档期，学生可申请退款。

---

## 5. 因天气无法改期时的退款标准

### 情形一：拍摄前 6 小时以上确认恶劣天气，且无法改期

如在拍摄前 6 小时以上确认因恶劣天气无法拍摄，并且双方无法达成新档期：

* 学生可获得 **100% 退款**；
* 如摄影师已实际产生服装、道具、清洗或运输准备成本，可按本规则第 6 条扣除；
* 若无实际准备成本，不得扣除费用。

### 情形二：拍摄前 6 小时内突发恶劣天气，且无法改期

如拍摄前 6 小时内突发恶劣天气，摄影师已开始准备、出发或到达拍摄地点：

* 学生可获得 **90% 退款**；
* 摄影师可扣除最高不超过订单金额 **10%** 的合理准备成本；
* 扣除金额需与服装、道具、清洗、交通或已发生准备行为相关；
* 若摄影师未产生实际准备成本，应尽量全额退款。

### 情形三：拍摄已开始，但因突发恶劣天气中断

如拍摄已经开始，但因突发暴雨、雷电、大风等情况无法继续：

* 拍摄完成不足 30%：优先免费补拍；如无法补拍，可退还 **70%–80%**；
* 拍摄完成约 30%–60%：优先免费补拍剩余部分；如无法补拍，可退还 **40%–60%**；
* 拍摄完成超过 60%：原则上不全额退款，摄影师应交付已完成部分照片，并可协商补拍少量镜头或给予适当优惠。

具体比例应根据实际拍摄时长、已完成场景、已拍照片数量和天气影响程度协商确定。

---

## 6. 摄影师服装准备费扣除标准

如摄影师提供学士服、帽子、披肩、学院色 hood、道具或其他拍摄服装，且已为该订单实际准备，可在退款时扣除合理准备成本。

### 可扣除项目

* 学士服或 hood 的租赁成本；
* 服装清洗、熨烫、维护成本；
* 道具准备成本；
* 已产生且不可退的第三方租赁费用；
* 因学生订单专门产生的运输或取还费用。

### 不可随意扣除项目

* 未实际发生的"预计成本"；
* 摄影师个人时间损失的任意估价；
* 未提前告知学生的隐藏费用；
* 与该学生订单无直接关系的日常经营成本；
* 未能提供合理说明的扣费。

### 扣除上限

除非订单页已明确写明更具体的服装/道具成本，否则默认扣除上限如下：

| 情况 | 可扣除上限 |
|------|-----------|
| 拍摄前 24 小时以上取消，且服装未实际准备 | ¥0 |
| 拍摄前 24 小时内取消，服装已准备 | 订单金额 10%，最高 ¥80 |
| 已产生不可退第三方租赁成本 | 订单金额 15%，最高 ¥120 |
| 摄影师无故取消或无法履约 | 不得扣除 |

如摄影师希望扣除超过以上标准的费用，必须在学生下单前于套餐页明确说明，并在退款时提供合理凭证或说明。

---

## 7. 普通小雨、阴天是否可以免费取消？

英国阴天、小雨、短时阵雨属于常见天气，不必然构成免费取消或退款理由。

以下情况通常不构成恶劣天气：

* 阴天但无明显降雨；
* 零星小雨，不影响正常拍摄；
* 气温较低但无安全风险；
* 天气不如预期但仍可完成拍摄；
* 学生临时觉得"不想拍了"或"想换晴天"。

但如果摄影师认为天气会明显影响成片质量，可以主动与学生协商免费改期。平台鼓励摄影师从用户体验出发，灵活处理毕业季拍摄。

---

## 8. 学生个人原因改期/取消

如非天气原因，学生因个人安排、考试、旅行、身体不适、化妆延误、迟到等原因申请改期或取消，适用以下规则：

| 申请时间 | 改期规则 | 退款建议 |
|---------|---------|---------|
| 拍摄前 72 小时以上 | 可免费改期一次 | 取消可退 90%–100% |
| 拍摄前 24–72 小时 | 视摄影师档期可改期 | 取消可退 70% |
| 拍摄前 6–24 小时 | 原则上不保证改期 | 取消可退 50% |
| 拍摄前 6 小时内 | 原则上不可取消 | 取消可退 0%–30% |
| 学生未到场 No-show | 不退款 | 0% |

如学生能提供合理证明，例如急诊、严重交通中断、学校临时强制安排等，摄影师可酌情提供一次友情改期。

---

## 9. 摄影师原因取消或迟到

如因摄影师个人原因导致无法拍摄，包括但不限于：

* 摄影师未按时到场；
* 摄影师临时取消；
* 摄影师忘记订单；
* 摄影师设备明显准备不足；
* 摄影师无法提供订单约定服务；
* 摄影师拒绝合理沟通。

学生有权选择：

1. 免费改期；或
2. 申请 **100% 退款**；或
3. 要求平台协助更换摄影师。

在摄影师原因导致取消的情况下，不得向学生扣除服装准备费。

---

## 10. 争议处理原则

如学生与摄影师对天气、改期或退款存在争议，平台可根据以下材料进行基础协调：

* Met Office 当日天气预警；
* 拍摄地实际天气截图；
* 双方沟通记录；
* 订单时间、地点和套餐内容；
* 摄影师是否已出发或完成准备；
* 学生是否按时到达；
* 已拍摄内容和完成比例；
* 已产生的合理服装或道具成本。

平台的协调意见不代表平台成为交易收款方或服务提供方。最终退款仍应由学生与摄影师直接完成。`;

export const WEATHER_POLICY_EN = `# UK Weather and Reschedule / Refund Policy

British weather is unpredictable, especially during the spring and summer graduation season in Durham, where showers, strong winds, cloudy skies and sudden weather changes are common. To protect the student shooting experience while respecting the photographer's schedule, travel and outfit preparation costs, the platform has established the following unified weather and reschedule/refund rules.

This policy applies to all graduation photo bookings made through the platform. By completing a booking, the student is deemed to have read and agreed to this policy.

---

## 1. Weather Assessment Criteria

The platform recommends using the following as the basis for weather assessment:

1. **Met Office Weather Warnings**
   Including Yellow / Amber / Red warnings, applicable to Durham / County Durham or the shooting location area.

2. **Actual Weather Conditions on the Day of Shooting**
   Including continuous rainfall, strong winds, thunderstorms, extreme cold, snow, ice, heavy fog or other conditions that clearly affect safety or image quality.

3. **Communication Records Between Both Parties**
   The student and photographer should confirm whether to reschedule through the platform booking page or platform-approved communication channels to preserve records.

---

## 2. Severe Weather Conditions Eligible for Free Rescheduling

If any of the following conditions occur, either the student or photographer may apply for **one free reschedule**:

### A. Official Weather Warnings

If any of the following warnings are issued for the shooting location area within 6 hours before or after the scheduled shooting time:

* Met Office Amber Warning;
* Met Office Red Warning;
* Yellow Warning that clearly affects outdoor shooting safety, such as heavy rain, thunderstorms, strong winds, ice/snow or severe fog.

### B. Actual Weather Clearly Affecting the Shoot

Even without an official warning, the following conditions may be considered severe weather:

* Continuous moderate to heavy rain that clearly affects makeup, outfits and equipment;
* Thunderstorm conditions;
* Strong winds causing difficulties with gowns, hair and props;
* Wet, flooded or icy ground creating safety risks;
* Very low visibility clearly affecting image quality;
* Photographer assessment that continuing the shoot may endanger equipment safety or personal safety.

### C. Temporary School or Venue Restrictions

If weather causes temporary closure of university buildings, lawns, bridges, castles, college areas or other shooting locations, and this clearly affects the original shooting plan, both parties may negotiate a free reschedule.

---

## 3. Weather Confirmation Timing

To avoid last-minute changes, the platform recommends a "two-step confirmation" process:

### First Confirmation: 24 Hours Before the Shoot

The photographer may communicate with the student about potential rescheduling risks based on weather forecasts.

This stage is only a reminder and does not serve as a final cancellation basis.

### Second Confirmation: 6 Hours Before the Shoot

Within 6 hours before the shoot, the decision to reschedule should be based on Met Office warnings, actual weather changes and communication between both parties.

If severe weather suddenly occurs within 6 hours before the shoot, both parties may still initiate a free reschedule based on the actual situation.

---

## 4. Free Rescheduling Rules

1. If severe weather prevents normal shooting, the student is entitled to one free reschedule.
2. The photographer should provide at least 2 alternative time slots.
3. The student should confirm within 48 hours of receiving the new time slots.
4. Free rescheduling should ideally be arranged within 30 days of the original shooting date, or within the graduation season shooting period.
5. If the student cannot accept the photographer's reasonable new time slots due to personal schedule constraints, they may proceed to the refund process.
6. If the photographer cannot provide any reasonable new time slots, the student may apply for a refund.

---

## 5. Refund Standards When Rescheduling Is Not Possible Due to Weather

### Scenario 1: Severe Weather Confirmed More Than 6 Hours Before the Shoot, and Rescheduling Is Not Possible

If severe weather is confirmed more than 6 hours before the shoot preventing the shoot, and both parties cannot agree on a new time slot:

* The student may receive a **100% refund**;
* If the photographer has incurred actual outfit, prop, cleaning or transport preparation costs, deductions may be made according to Rule 6;
* If no actual preparation costs were incurred, no deductions may be made.

### Scenario 2: Severe Weather Occurs Within 6 Hours Before the Shoot, and Rescheduling Is Not Possible

If severe weather suddenly occurs within 6 hours before the shoot and the photographer has already begun preparation, departed or arrived at the shooting location:

* The student may receive a **90% refund**;
* The photographer may deduct up to **10%** of the booking amount as reasonable preparation costs;
* Deductions must be related to outfits, props, cleaning, transport or preparation actions already taken;
* If the photographer has not incurred actual preparation costs, a full refund should be provided where possible.

### Scenario 3: Shooting Has Started but Is Interrupted by Severe Weather

If the shooting has already started but cannot continue due to sudden heavy rain, thunderstorms, strong winds or similar conditions:

* Less than 30% completed: Free reshoot preferred; if not possible, **70%–80%** refund;
* Approximately 30%–60% completed: Free reschedule for remaining portions preferred; if not possible, **40%–60%** refund;
* More than 60% completed: Full refund is not typically applicable; the photographer should deliver completed photos and may negotiate additional shots or appropriate discounts.

Specific percentages should be determined through negotiation based on actual shooting duration, completed scenes, number of photos taken and the degree of weather impact.

---

## 6. Photographer Outfit Preparation Cost Deduction Standards

If the photographer provides graduation gowns, caps, hoods, college-coloured hoods, props or other shooting outfits, and has actually prepared them for the booking, reasonable preparation costs may be deducted from the refund.

### Deductible Items

* Rental costs for gowns or hoods;
* Outfit cleaning, pressing and maintenance costs;
* Prop preparation costs;
* Non-refundable third-party rental fees already incurred;
* Transport or collection/return costs specifically incurred for the student's booking.

### Non-Deductible Items

* "Estimated costs" not actually incurred;
* Arbitrary valuation of the photographer's personal time loss;
* Hidden fees not disclosed to the student in advance;
* Daily operating costs not directly related to the student's booking;
* Deductions without reasonable justification.

### Deduction Caps

Unless the booking page has clearly stated more specific outfit/prop costs, the following default deduction caps apply:

| Situation | Maximum Deductible |
|-----------|-------------------|
| Cancellation more than 24 hours before shoot, outfit not actually prepared | ¥0 |
| Cancellation within 24 hours of shoot, outfit prepared | 10% of booking amount, max ¥80 |
| Non-refundable third-party rental costs incurred | 15% of booking amount, max ¥120 |
| Photographer cancels without reason or fails to fulfil | No deduction permitted |

If the photographer wishes to deduct fees exceeding these standards, they must clearly state this on the package page before the student books and provide reasonable documentation or explanation when processing refunds.

---

## 7. Can Light Rain or Cloudy Weather Justify Free Cancellation?

Cloudy skies, light rain and brief showers are common weather conditions in the UK and do not necessarily constitute grounds for free cancellation or refund.

The following conditions typically do not constitute severe weather:

* Cloudy but no significant rainfall;
* Scattered light rain that does not affect normal shooting;
* Low temperatures without safety risks;
* Weather not meeting expectations but still allowing the shoot to proceed;
* Student simply "not feeling like shooting" or "wanting a sunny day."

However, if the photographer believes the weather will clearly affect image quality, they may proactively negotiate a free reschedule with the student. The platform encourages photographers to handle graduation season shoots flexibly with the user experience in mind.

---

## 8. Rescheduling / Cancellation for Personal Reasons

If the student requests rescheduling or cancellation for personal reasons (not weather-related), including but not limited to personal arrangements, exams, travel, illness, makeup delays or lateness, the following rules apply:

| Request Timing | Reschedule Rules | Refund Suggestion |
|---------------|-----------------|-------------------|
| More than 72 hours before shoot | One free reschedule | 90%–100% refund |
| 24–72 hours before shoot | Reschedule subject to photographer availability | 70% refund |
| 6–24 hours before shoot | Reschedule not guaranteed | 50% refund |
| Within 6 hours of shoot | Cancellation not permitted in principle | 0%–30% refund |
| Student no-show | No refund | 0% |

If the student can provide reasonable documentation (e.g., emergency hospital visit, severe transport disruption, mandatory university arrangement), the photographer may offer one courtesy reschedule at their discretion.

---

## 9. Cancellation or Lateness by Photographer

If the photographer is unable to conduct the shoot for personal reasons, including but not limited to:

* Photographer fails to arrive on time;
* Photographer cancels last minute;
* Photographer forgets the booking;
* Photographer has clearly insufficient equipment preparation;
* Photographer is unable to provide the contracted service;
* Photographer refuses reasonable communication.

The student may choose to:

1. Reschedule for free; or
2. Apply for a **100% refund**; or
3. Request platform assistance to switch photographers.

No outfit preparation fee may be deducted from the student when cancellation is caused by the photographer.

---

## 10. Dispute Resolution Principles

If the student and photographer disagree regarding weather, rescheduling or refunds, the platform may provide basic coordination based on the following materials:

* Met Office weather warnings for the day;
* Actual weather screenshots from the shooting location;
* Communication records between both parties;
* Booking time, location and package details;
* Whether the photographer has departed or completed preparation;
* Whether the student arrived on time;
* Content shot and completion percentage;
* Actual outfit or prop costs incurred.

The platform's coordination opinion does not mean the platform becomes a party to the transaction or responsible for funds. Final refunds should still be completed directly between the student and photographer.`;

// ─── 注册条款 ─────────────────────────────────────────────────────

export const REGISTRATION_TERMS = `# SnapGown 用户注册条款

注册或使用 SnapGown 平台即表示您已阅读、理解并同意以下全部条款。请在完成注册前仔细阅读。

---

## 1. 账户安全与信息真实性

1.1 用户（包括学生与摄影师）在注册时提供的微信号、邮箱地址、手机号码等信息必须真实、准确、完整。

1.2 用户不得冒用、盗用他人身份信息进行注册，不得使用虚假信息创建账户。

1.3 摄影师用于展示的样片必须为其本人拍摄或已取得合法授权的作品。盗用他人摄影作品作为样片将被视为严重违规。

1.4 用户应妥善保管账户凭证（邮箱与密码），因个人原因导致的账户泄露或被盗用，平台不承担责任。

1.5 如发现账户存在异常登录或被盗用风险，用户应立即通知平台并修改密码。

---

## 2. 摄影师专项抽佣契约

2.1 入驻 SnapGown 平台的摄影师明确知晓并同意：平台对每笔成功完成的订单收取 **15% 的服务佣金**（以订单金额的英镑计价）。

2.2 佣金自订单状态变更为"已完成"（COMPLETED）时自动计算，并记录于平台佣金台账。

2.3 当摄影师账户累计未结佣金超过 **£30（3000 便士）** 时，平台有权执行自动化熔断机制：

  a) 系统将自动暂停（Suspend）该摄影师新档期的公开展示；
  b) 学生将无法查看和预约该摄影师的新时间段；
  c) 此状态将持续至摄影师结清全部欠款或经平台人工审核解除。

2.4 摄影师可通过后台查看实时佣金欠款明细，并通过指定方式完成结算。

2.5 平台保留根据市场情况调整佣金比例的权利，调整前将提前 14 天以站内通知或邮件方式告知摄影师。

---

## 3. 英国 GDPR 隐私授权

3.1 用户同意平台出于以下目的，合法收集、存储并处理其个人数据：

  a) **订单撮合**：将学生预约信息传递给摄影师以完成拍摄服务；
  b) **通知提醒**：通过邮件、微信等方式发送订单确认、状态变更、预约提醒等必要通知；
  c) **平台运营**：用于账户管理、纠纷协调、佣金结算等平台正常运营活动。

3.2 平台收集的个人数据包括但不限于：姓名、微信号、手机号码、邮箱地址、拍摄订单记录、支付凭证截图。

3.3 平台将严格遵守《英国通用数据保护条例》（UK GDPR）及《数据保护法 2018》（Data Protection Act 2018）的相关规定，采取合理的技术和管理措施保护用户数据安全。

3.4 用户有权依据 GDPR 要求，向平台申请查阅、更正或删除其个人数据。如有相关需求，请通过平台提供的联系方式与管理员沟通。

3.5 平台不会将用户个人数据出售或提供给与平台运营无关的第三方。

---

## 4. 平台终止服务权

4.1 对于存在以下行为的账号，平台保留单方面封禁、终止服务的权利：

  a) 恶意欺诈：包括但不限于虚构订单、伪造支付凭证、骗取退款等行为；
  b) 频繁引发退款纠纷：多次无正当理由申请退款或恶意拖延确认流程；
  c) 违反平台秩序：包括发布虚假信息、骚扰其他用户、发布违法违规内容等；
  d) 严重违反注册条款：包括冒用他人身份、盗用摄影作品、提供虚假信息等。

4.2 平台在执行封禁前，将视情况给予用户申诉机会。对于严重违规行为，平台有权立即执行封禁而不另行通知。

4.3 被封禁账号的未结款项（如有）将按照平台规定的流程进行处理，但平台不保证被封禁用户能够获得全额退款。

4.4 平台终止服务后，用户仍有义务完成其已产生但尚未结清的付款义务。

---

## 5. 其他条款

5.1 本条款的最终解释权归 SnapGown 平台所有。

5.2 平台有权根据法律法规变化或业务发展需要，对本条款进行修订。修订后的条款将在平台上公布，继续使用平台服务即视为同意修订后的条款。

5.3 如本条款与中华人民共和国法律或英格兰及威尔士法律存在冲突，以适用法律为准。

`;

export default COPY;
