import React, { useState, useContext } from 'react';
import { Table, Tag, Space, Button, Form, Input, Modal, InputNumber, DatePicker, message, Select } from 'antd';
import { useEffect } from 'react';
import styles from './AllItems.module.css'
import auctionCreator from '../eth'

import { AccountContext } from '../App'

import { formatBalance, time2Date } from '../utils'

const statusMap = {
  0: 'processing',
  1: 'achieve the goal',
  2: 'request withdrawal',
  3: 'finished(failed or withdraw successfully)'
}

const MyTable = (props) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Auction Duration',
      dataIndex: 'auctionDuration',
      key: 'auctionDuration',
      // render: (time) => time2Date(time)
    },
    {
      title: 'IsEnglishAution',
      dataIndex: 'isEnglishAution',
      key: 'isEnglishAution',
      render: (isEnglishAution) => {
        return isEnglishAution ? 'yes' : 'not'
      }
    },
    {
      title: 'HighestBid(ETH)',
      dataIndex: 'highestBid',
      key: 'highestBid',
      // render: (current_money) => formatBalance(current_money)
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller',
    },
    // {
    //   title: 'Actions',
    //   key: 'action',
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a onClick={
    //         () => {
    //           props.setIsModalOpen(true)
    //           props.setRow(record)
    //         }
    //       }>Details</a>

    //       <a onClick={
    //         () => {
    //           props.setRow(record)
    //           props.setApplyModal(true)
              
    //         }
    //       }>Request a withdrawal</a>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <div style={{ marginTop: "20px", height: '100%',overflow:"hidden", overflowY: 'auto' }}>
      <Table 
        columns={columns} 
        pagination={false}
        dataSource={props.data} 
      />
    </div>
  );
};
// Page
const Page = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState([])
    const [row, setRow] = useState({})
    const [isAddModal, setIsAddModal] = useState(false)
    const [form] = Form.useForm();
    const [applyForm] = Form.useForm()
    const [applyModal, setApplyModal] = useState(false)

    const [account] = useContext(AccountContext)

    useEffect(() => {
      message.loading('loading', 0)
      getData()
      return () => message.destroy()
    }, [])
  
    const getData = async () => {
      const allAuctionIds = await auctionCreator.methods.getAllAuctionsDetails().call()
      console.log('getFundingInfoArray', allAuctionIds)
      // if(allAuctionIds) {
      //   const arr = []
      //   for(let i = 0; i<allAuctionIds.length; i++) {
      //     const auction = await auctionCreator.methods.auctions(i).call()
      //     console.log(auction)
      //     arr.push(auction)
      //   }
        
        setData(allAuctionIds)
        message.destroy()
      // }
    }

    const onFinish = async (formData) => {
      const res = await auctionCreator.methods.createAuction(account.address, formData._nftId, formData._startingBid, formData._auctionDuration, formData._isEnglishAuction, formData.name).send({
        from: account.address,
        gas: '3000000',
      })
      message.success('created!')
      setIsAddModal(false)
      getData()
    }

    const onApplyFinish = async (applyData) => {
      
      
    }

    return (
        <>
        <Button type="primary" onClick={() => { form.resetFields(); setIsAddModal(true) }}>Create a auction</Button>

        {/* Page */}
        <MyTable 
            data={data}
            setIsModalOpen={setIsModalOpen}
            setRow={setRow}
            setApplyModal={setApplyModal}
        />

        {/* Details pop-up box */}
        <Modal title="Details" open={isModalOpen} onOk={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)}>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>Name: </span>{row.name}
          </div>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>EndAt: </span>{row.endAt}
          </div>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>IsEnglishAution: </span>{row.isEnglishAuction ? 'yes':'not'}
          </div>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>HighestBid(ETH): </span>{row.highestBid}
          </div>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>Seller: </span>{row.seller}
          </div>
        </Modal>

        {/* Create a auction pop-up box */}
        <Modal title="Create a auction" open={isAddModal} onOk={() => {form.submit();setIsAddModal(false)}} onCancel={() => setIsAddModal(false)}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item name="name">
                    <Input placeholder="Name" />
                </Form.Item>
                <Form.Item name="_nftId">
                    <Input placeholder="NftId" />
                </Form.Item>
                <Form.Item name="_startingBid">
                    <Input placeholder="StartingBid" />
                </Form.Item>
                <Form.Item name="_isEnglishAuction">
                    <Select placeholder="IsEnglishAuction" options={[{label: 'yes', value: true}, {label: 'no', value: false}]} />
                </Form.Item>
                <Form.Item name="_auctionDuration">
                  <InputNumber placeholder="AuctionDuration" />
                </Form.Item>
            </Form>
        </Modal>

        {/* Request a withdrawal */}
        <Modal title="Request a withdrawal" okText='apply'  open={applyModal} onOk={() => {applyForm.submit();setApplyModal(false)}} onCancel={() => setApplyModal(false)}>
            <Form
                form={applyForm}
                layout="vertical"
                onFinish={onApplyFinish}
            >
                <Form.Item name="description">
                    <Input placeholder="Aim" />
                </Form.Item>
            </Form>
        </Modal>
        </>
    )
}
export default Page