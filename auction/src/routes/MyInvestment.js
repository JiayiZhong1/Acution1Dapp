import React, { useState, useContext } from 'react';
import { Table, Tag, Space, Button, Form, Input, Modal, InputNumber, DatePicker, message } from 'antd';
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
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={
            () => {
              props.setIsModalOpen(true)
              props.setRow(record)
            }
          }>Details</a>
          <a onClick={
            () => {
                props.agreeWithdraw(record)
            }
            }>Withdraw</a>
        </Space>
      ),
    },
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

    const [account] = useContext(AccountContext)

    useEffect(() => {
      message.loading('loading', 0)
      getData()
      return () => message.destroy()
    }, [])
  
    const getData = async () => {
      const allFundings = await auctionCreator.methods.getMyBiddedAuctions().call()
      console.log('InvestedFundings', allFundings)
      setData(allFundings)
      message.destroy()
    }

    const agreeWithdraw = async (row) => {
      message.loading('loading', 0)
      try {
        const res =  await auctionCreator.methods.agree_withdraw(
          row.index,
          1
        ).send({
          from: account.address,
          gas: '3000000', 
        })
        console.log(res)
        message.success('Withdrawal successful!')
        getData()
      } finally {
        message.destroy()
      }
    }

    return (
        <>
        {/* Table */}
        <MyTable 
            data={data}
            setIsModalOpen={setIsModalOpen}
            setRow={setRow}
            agreeWithdraw={agreeWithdraw}
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
            <span className={styles.label}>Price(ETH): </span>{row.price}
          </div>
          <div style={{
            lineHeight: '20px',
            padding: '10px 20px'
          }}>
            <span className={styles.label}>Seller: </span>{row.seller}
          </div>
        </Modal>
        </>
    )
}
export default Page