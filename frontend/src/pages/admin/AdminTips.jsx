import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTips, createTip, updateTip, deleteTip } from '../../services/adminService';

const { Title } = Typography;

const AdminTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [form] = Form.useForm();

  const fetchTips = async () => {
    setLoading(true);
    try {
      const data = await getTips(0, 100);
      setTips(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách Tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const showModal = (tip = null) => {
    setEditingTip(tip);
    if (tip) {
      form.setFieldsValue(tip);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTip(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTip) {
        await updateTip(editingTip.id, values);
        message.success("Cập nhật thành công!");
      } else {
        await createTip(values);
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      setEditingTip(null);
      form.resetFields();
      fetchTips();
    } catch (error) {
      if (error.errorFields) return;
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTip(id);
      message.success("Xóa Tip thành công!");
      fetchTips();
    } catch (error) {
      message.error("Lỗi khi xóa Tip");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Icon (Material Symbol)',
      dataIndex: 'icon',
      key: 'icon',
      width: 180,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Xóa Health Tip này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2} className="!m-0">Quản Lý Health Tips</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm Mới
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={tips} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTip ? "Sửa Health Tip" : "Thêm Mới Health Tip"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingTip ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Dinh dưỡng, Giấc ngủ..." />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nội dung của tip sức khỏe..." />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon (Material Symbol)"
          >
            <Input placeholder="Ví dụ: psychology, restaurant, fitness_center" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTips;
