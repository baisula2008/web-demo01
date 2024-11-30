const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 更详细的CORS配置
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

// MongoDB连接配置
mongoose.connect('mongodb+srv://baisula001:baisula001@cluster0.mongodb.net/study_abroad_platform?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: '服务器错误',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 添加基础路由用于测试服务器状态
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// 用户模型
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 申请记录模型
const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'pending' },
    files: [String],
    progress: {
        materialSubmission: { type: Boolean, default: false },
        initialReview: { type: Boolean, default: false },
        secondaryReview: { type: Boolean, default: false },
        finalReview: { type: Boolean, default: false }
    },
    records: [{
        title: String,
        content: String,
        date: { type: Date, default: Date.now }
    }]
});

const Application = mongoose.model('Application', applicationSchema);

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API路由
// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        
        // 验证必填字段
        const { username, email, password, phone } = req.body;
        if (!username || !email || !password || !phone) {
            return res.status(400).json({ 
                message: '注册失败', 
                error: '所有字段都是必填的' 
            });
        }

        // 创建新用户
        const user = new User(req.body);
        await user.save();
        
        console.log('User registered successfully:', user);
        res.status(201).json({ 
            message: '注册成功', 
            userId: user._id 
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // 处理重复用户名或邮箱的情况
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: '注册失败', 
                error: '用户名或邮箱已被使用' 
            });
        }
        
        res.status(400).json({ 
            message: '注册失败', 
            error: error.message 
        });
    }
});

// 文件上传
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ files: fileUrls });
    } catch (error) {
        res.status(400).json({ message: '上传失败', error: error.message });
    }
});

// 获取申请进度
app.get('/api/application/:userId', async (req, res) => {
    try {
        const application = await Application.findOne({ userId: req.params.userId });
        res.json(application);
    } catch (error) {
        res.status(400).json({ message: '获取失败', error: error.message });
    }
});

// 更新申请进度
app.put('/api/application/:id', async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(application);
    } catch (error) {
        res.status(400).json({ message: '更新失败', error: error.message });
    }
});

// 管理员验证中间件
const adminAuth = (req, res, next) => {
    // 这里应该添加proper的管理员验证逻辑
    // 现在仅作演示用途
    next();
};

// 更新理员API路由,添加验证
app.get('/api/admin/applications', adminAuth, async (req, res) => {
    try {
        // 获取所有申请和联系表单
        const [applications, contacts] = await Promise.all([
            Application.find().populate('userId', 'username email phone'),
            Contact.find()
        ]);

        // 合并并排序结果
        const allItems = [
            ...applications.map(app => ({
                ...app.toObject(),
                itemType: 'application'
            })),
            ...contacts.map(contact => ({
                ...contact.toObject(),
                itemType: 'contact'
            }))
        ].sort((a, b) => b.createdAt - a.createdAt);

        res.json(allItems);
    } catch (error) {
        res.status(500).json({ message: '获取列表失败', error: error.message });
    }
});

app.get('/api/admin/applications/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('userId', 'username email phone');
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: '获取申请详情失败', error: error.message });
    }
});

// 添加联系表单模型
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    address: String,
    notes: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, default: 'contact' }
});

const Contact = mongoose.model('Contact', contactSchema);

// 添加联系表单提交路由
app.post('/api/contact', async (req, res) => {
    try {
        console.log('收到联系表单数据:', req.body);

        // 验证必填字段
        const { name, phone, date, time } = req.body;
        if (!name || !phone || !date || !time) {
            console.log('缺少必填字段');
            return res.status(400).json({
                message: '提交失败',
                error: '所有字段都是必填的'
            });
        }

        const contact = new Contact(req.body);
        console.log('创建联系记录:', contact);

        await contact.save();
        console.log('联系记录保存成功');
        
        res.status(201).json({
            message: '提交成功',
            contactId: contact._id
        });
    } catch (error) {
        console.error('联系表单提交错误:', error);
        res.status(500).json({
            message: '提交失败',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
}); 