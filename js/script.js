document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotBox = document.querySelector('.chatbot-box');
    const closeBtn = document.querySelector('.close-btn');
    const chatMessages = document.querySelector('.chatbot-messages');
    const chatInput = document.getElementById('chatbot-input');
    const sendBtn = document.querySelector('.send-btn');

    // 预设的问答对
    const qaDatabase = {
        '费用': '我们的留学咨询服务费用根据申请的项目和服务内容而定：\n' +
               '1. 本科申请：¥30,000起\n' +
               '2. 硕士申请：¥40,000起\n' +
               '3. 博士申请：¥50,000起\n' +
               '4. 语言培训：¥200/课时\n' +
               '具体费用请联系我们的顾问进行详细咨询。',
        '时间': '我们的工作时间如下：\n' +
               '周一至周五：9:00-18:00\n' +
               '周六：10:00-16:00\n' +
               '节假日可预约咨询',
        '流程': '留学申请的基本流程如下：\n' +
               '1. 免费初步咨询\n' +
               '2. 确定目标院校和专业\n' +
               '3. 制定申请策略\n' +
               '4. 准备申请材料\n' +
               '5. 提交申请并跟踪\n' +
               '6. 签证指导服务',
        '联系': '您可以通过以下方式联系我们：\n' +
               '电话：1234567890\n' +
               '邮箱：info@example.com\n' +
               '地址：[您的具体地址]\n' +
               '微信：[公众号]',
        '学校': '我们与多所世界知名院校有合作关系，包括：\n' +
               '🇺🇸 美国：哈佛、斯坦福、MIT\n' +
               '🇬🇧 英国：牛津、剑桥、帝国理工\n' +
               '🇦🇺 澳洲：墨尔本大学、悉尼大学\n' +
               '🇨🇦 加拿大：多伦多大学、UBC',
        '专业': '我们提供以下热门专业的申请咨询：\n' +
               '📊 商科：金融、MBA、会计\n' +
               '💻 理工：计算机、人工智能、工程\n' +
               '🎨 艺术：设计、建筑、媒体\n' +
               '🔬 医学：临床医学、生物科技',
        '预科': '关于预科班的建议：\n' +
               '1. 适合人群：高考成绩不理想、语言未达标、需要衔接课程的学生\n' +
               '2. 优势：提供语言培训、专业课程预习、文化适应训练\n' +
               '3. 时长：通常6-12个月\n' +
               '4. 费用：约15-20万人民币/年\n' +
               '具体是否需要就读预科，建议进行一对一评估。',
        '技能签证': '技能签证申请说明：\n' +
               '1. 申请条件：学历要求、工作经验、语言水平\n' +
               '2. 材料准备：学历认证、工作证明、技能评估\n' +
               '3. 处理周期：通常3-6个月\n' +
               '4. 成功率：根据个人背景和准备情况而定\n' +
               '建议预约顾问进行详细评估。'
    };

    // 添加快速回复按钮
    function addQuickReplies() {
        const quickReplies = document.createElement('div');
        quickReplies.className = 'quick-replies';
        quickReplies.innerHTML = `
            <button class="quick-reply-btn" data-query="费用">费用咨询</button>
            <button class="quick-reply-btn" data-query="时间">服务时间</button>
            <button class="quick-reply-btn" data-query="流程">申请流程</button>
            <button class="quick-reply-btn" data-query="联系">联系方式</button>
        `;
        chatMessages.appendChild(quickReplies);

        // 添加快速回复按钮的点击事件
        const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
        quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                addUserMessage(query);
                setTimeout(() => addBotResponse(query), 500);
            });
        });
    }

    // 添加用户消息
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 添加机器人响应
    function addBotResponse(query) {
        // 显示输入中状态
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);

        setTimeout(() => {
            chatMessages.removeChild(typingDiv);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message bot';
            
            // 检查是否有预设回答
            let response = qaDatabase[query] || getSmartResponse(query);

            messageDiv.innerHTML = `<p>${response}</p>`;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }

    // 发送消息的处理函数
    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addUserMessage(message);
            chatInput.value = '';
            setTimeout(() => addBotResponse(message), 500);
        }
    }

    // 事件监听器
    chatbotToggle.addEventListener('click', () => {
        chatbotBox.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        chatbotBox.classList.remove('active');
    });

    sendBtn.addEventListener('click', handleSendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // 初始化快速回复按钮
    addQuickReplies();

    // 添加更多智能回复规则
    function getSmartResponse(message) {
        message = message.toLowerCase();
        if (message.includes('你好') || message.includes('您好')) {
            return '您好！很高兴为您服务。请问有什么可以帮助您？';
        } else if (message.includes('谢谢') || message.includes('感谢')) {
            return '不客气！如果还有任何问题，随时都可以询问我。';
        } else if (message.includes('学校') || message.includes('大学')) {
            return qaDatabase['学校'];
        } else if (message.includes('专业') || message.includes('方向')) {
            return qaDatabase['专业'];
        } else if (message.includes('费用') || message.includes('价格')) {
            return qaDatabase['费用'];
        } else if (message.includes('时间') || message.includes('几点')) {
            return qaDatabase['时间'];
        } else if (message.includes('流程') || message.includes('步骤')) {
            return qaDatabase['流程'];
        } else if (message.includes('联系') || message.includes('电话')) {
            return qaDatabase['联系'];
        } else if (message.includes('预科')) {
            return qaDatabase['预科'];
        } else if (message.includes('技能') || message.includes('签证')) {
            return qaDatabase['技能签证'];
        } else {
            return '抱歉，我可能没有完全理解您的问题。您可以：\n' +
                   '1. ��个方式描述您的问题\n' +
                   '2. 点击上方快速回复按钮\n' +
                   '3. 直接联系我们的人工顾问：1234567890';
        }
    }

    // 添加侧边栏功能
    const triggerArea = document.querySelector('.trigger-area');
    const sideMenu = document.querySelector('.side-menu');
    let isMenuOpen = false;

    // 鼠标进入触发区域时显示菜单
    triggerArea.addEventListener('mouseenter', () => {
        sideMenu.style.left = '0';
        isMenuOpen = true;
    });

    // 鼠标离开整个区域时隐藏菜单
    document.addEventListener('mousemove', (e) => {
        if (isMenuOpen && e.clientX > 320) { // 320px 是侧边栏的宽度
            sideMenu.style.left = '-300px';
            isMenuOpen = false;
        }
    });

    // 鼠标进入菜单时保持显示
    sideMenu.addEventListener('mouseenter', () => {
        isMenuOpen = true;
        sideMenu.style.left = '0';
    });

    // 为每个菜单项添加悬停效果
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.height = '300px';
        });

        item.addEventListener('mouseleave', () => {
            item.style.height = '60px';
        });
    });

    // 打开聊天机器人的函数
    window.openChatbot = function() {
        const chatbotBox = document.querySelector('.chatbot-box');
        chatbotBox.classList.add('active');
    };

    // 处理注册按钮点击事件
    document.querySelector('.register-btn').addEventListener('click', function(e) {
        e.preventDefault(); // 防止默认行为
        window.location.href = 'user-platform.html'; // 跳转到注册页面
    });
}); 