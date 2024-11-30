// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 注册表单提交处理
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('注册成功！');
            localStorage.setItem('userId', data.userId);
            await uploadFiles();
        } else {
            alert(`注册失败: ${data.message}\n${data.error || ''}`);
            console.error('Registration error:', data);
        }
    } catch (error) {
        alert('注册失败，请确保服务器已启动');
        console.error('Error:', error);
    }
}

// 初始化文件上传
function initializeFileUpload() {
    const documentInput = document.getElementById('documentInput');
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');

    // 文档文件上传处理
    const documentButton = document.querySelector('.format-item[data-type="document"]');
    documentButton.addEventListener('click', (e) => {
        e.preventDefault();
        documentInput.click();
    });

    // 图片文件上传处理
    const imageButton = document.querySelector('.format-item[data-type="image"]');
    imageButton.addEventListener('click', (e) => {
        e.preventDefault();
        imageInput.click();
    });

    // 文件选择处理
    documentInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, 'document');
    });

    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, 'image');
    });

    // 拖拽上传处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#4169E1';
        uploadArea.style.backgroundColor = 'rgba(65, 105, 225, 0.05)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = 'transparent';
        
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
                handleFiles([file], 'document');
            } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
                handleFiles([file], 'image');
            } else {
                alert('不支持的文件格式');
            }
        });
    });
}

// 文件处理函数
function handleFiles(files, type) {
    Array.from(files).forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        
        // 检查文件大小
        let maxSize = 5 * 1024 * 1024; // 默认5MB
        if (extension === 'pdf') {
            maxSize = 20 * 1024 * 1024; // PDF 20MB
        } else if (['doc', 'docx'].includes(extension)) {
            maxSize = 10 * 1024 * 1024; // Word 10MB
        }

        if (file.size > maxSize) {
            alert(`文件大小超过限制：\nPDF：20MB\nWord：10MB\n其他：5MB`);
            return;
        }

        // 创建文件预览项
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // 根据文件类型显示不同图标
        let icon = '📄';
        if (['png', 'jpg', 'jpeg'].includes(extension)) {
            icon = '🖼️';
        } else if (['doc', 'docx'].includes(extension)) {
            icon = '📝';
        } else if (extension === 'txt') {
            icon = '📋';
        }
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <span class="file-icon">${icon}</span>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
            <div class="file-actions">
                <span class="file-delete" onclick="removeFile(this)">删除</span>
            </div>
        `;

        document.getElementById('fileList').appendChild(fileItem);
    });
}

// 删除文件
function removeFile(element) {
    element.closest('.file-item').remove();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取申请进度
async function getApplicationProgress() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/application/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
            updateProgressUI(data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 更新进度UI
function updateProgressUI(application) {
    const steps = document.querySelectorAll('.progress-step');
    const statusBadge = document.querySelector('.status-badge');
    
    // 更新进度点
    if (application.progress) {
        steps.forEach((step, index) => {
            const dot = step.querySelector('.step-dot');
            if (index === 0 && application.progress.materialSubmission) {
                dot.classList.add('completed');
            } else if (index === 1 && application.progress.initialReview) {
                dot.classList.add('completed');
            } else if (index === 2 && application.progress.secondaryReview) {
                dot.classList.add('completed');
            } else if (index === 3 && application.progress.finalReview) {
                dot.classList.add('completed');
            }
        });
    }
    
    // 更新状态标签
    if (application.status) {
        statusBadge.className = `status-badge status-${application.status}`;
        statusBadge.textContent = getStatusText(application.status);
    }
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成'
    };
    return statusMap[status] || status;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 注册表单提交事件
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 初始化文件上传区域
    initializeFileUpload();
    
    // 获取申请进度
    getApplicationProgress();
}); 