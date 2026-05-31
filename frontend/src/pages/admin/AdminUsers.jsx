import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Select, Switch, Popconfirm, message, Typography, Input } from 'antd';
import { getUsers, updateUser, deleteUser } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(0, 100, searchText, roleFilter, activeFilter);
      setUsers(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchText, roleFilter, activeFilter]);

  const handleRoleChange = async (userId, value) => {
    try {
      await updateUser(userId, { role: value });
      message.success("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi cập nhật quyền");
    }
  };

  const handleStatusChange = async (userId, checked) => {
    try {
      await updateUser(userId, { is_active: checked });
      message.success(checked ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!");
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      message.success("Đã xóa vĩnh viễn người dùng!");
      fetchUsers();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lỗi khi xóa người dùng");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      key: 'is_active',
      render: (_, record) => (
        <Switch 
          checkedChildren="Active" 
          unCheckedChildren="Locked" 
          checked={record.is_active} 
          disabled={record.id === user?.id}
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: 'Phân quyền',
      key: 'role',
      render: (_, record) => (
        <Select
          value={record.role}
          style={{ width: 120 }}
          disabled={record.id === user?.id}
          onChange={(val) => handleRoleChange(record.id, val)}
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.id === user?.id ? (
            <span style={{ color: '#ccc' }}>Xóa</span>
          ) : (
            <Popconfirm
              title="Xóa người dùng này?"
              description="Dữ liệu bị xóa sẽ không thể khôi phục."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa vĩnh viễn"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <a style={{ color: 'red' }}>Xóa</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản Lý Người Dùng</Title>
      
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Input.Search
          placeholder="Tìm username hoặc email..."
          allowClear
          onSearch={(value) => setSearchText(value)}
          className="w-full sm:w-64"
        />
        <Select
          allowClear
          placeholder="Lọc theo Role"
          className="w-full sm:w-36"
          onChange={(value) => setRoleFilter(value || '')}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ]}
        />
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          className="w-full sm:w-36"
          onChange={(value) => setActiveFilter(value !== undefined ? value : '')}
          options={[
            { value: true, label: 'Active' },
            { value: false, label: 'Locked' },
          ]}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminUsers;
