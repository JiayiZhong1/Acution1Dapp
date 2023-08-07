import React, { useState, useEffect, useContext } from 'react';
import { Table, Tag, Space, Button, InputNumber, Modal, message } from 'antd';
import styles from './AllItems.module.css'
import auctionCreator from '../eth'
import auction from '../eth/auction'

import { AccountContext } from '../App'
import web3 from '../eth/web3'
import { formatBalance, time2Date } from '../utils'
import Info from './Info'

const statusMap = {
  0: 'processing',
  1: 'achieve the goal',
  2: 'request withdrawal',
  3: 'finished(failed or withdraw successfully)'
}

// Table of this page
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
      render: (_, record, i) => ( 
        <Space size="middle">
          <a onClick={
            () => {
              props.setIsModalOpen(true)
              props.setRow(record)
            }
          }>Details</a>

          <a onClick={
            () => {
              props.setDonateModal(true)
              props.setRow({...record, index: i})
            }
          }>Bid</a>
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
  const [isModalOpen, setIsModalOpen] = useState(false) //Controls whether the details box on the current page is displayed
  const [data, setData] = useState([]) //Table data
  const [row, setRow] = useState({}) //List detail data for the current modal display
  const [donateModal, setDonateModal] = useState(false) //Controls whether the donation modal is displayed
  const [inputValue, setInputValue] = useState(0) //Amount of money invested

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

  const bidAction = async () => {
    message.loading('loading', 0)
    let amount = inputValue
    try {
      console.log(row.nftId)
      const res =  await auctionCreator.methods.placeBid(row.index).send({
        from: account.address,
        gas: '300000',
        value: web3.utils.toWei(amount.toString(), 'ether'), 
      })
      console.log(res)
      message.success('bided!')
      getData()
    } finally{
      setDonateModal(false)
      setInputValue(0)
      message.destroy()
    }
   
  }

  return (
      <>
      <Info />
      {/* Table */}
      <MyTable 
        data={data}
        setIsModalOpen={setIsModalOpen}
        setRow={setRow}
        setDonateModal={setDonateModal}
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

      {/* Donation pop-up box */}
      <Modal title="Bid" footer={null} open={donateModal} onCancel={() => setDonateModal(false)}>
        {/* <div style={{
          lineHeight: '20px',
          padding: '10px 20px'
        }}>
          <span className={styles.label}>The maximum amount that can be bided is: 10ETH</span>
        </div> */}
        <div style={{
          lineHeight: '20px',
          padding: '10px 20px'
        }}>
          Please enter the amount of your bid: <InputNumber style={{width: '120px'}} value={inputValue} onChange={num => {
            setInputValue(num)
          }} /> ETH <Button type="primary" onClick={bidAction}>Bid</Button>
        </div>
      </Modal>
      </>
  )
}
export default Page