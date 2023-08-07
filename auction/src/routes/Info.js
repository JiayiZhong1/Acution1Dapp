import React, { useEffect, useContext } from 'react';
import { Button, message } from 'antd'

import web3 from '../eth/web3'
import { AccountContext } from '../App'
import { formatBalance } from '../utils'

const Info = () => {
  const [account, setAccount] = useContext(AccountContext)

  useEffect(() => {
    
  }, [])

  const handleConnect = async () => {
    try {
      let accounts = await web3.eth.getAccounts();
      let balance = await web3.eth.getBalance(accounts[0])
      setAccount({
        address: accounts[0],
        balance,
      })
      localStorage.setItem("account", JSON.stringify({
        address: accounts[0],
        balance,
      }))
    }catch(err) {
      message.error(err.message)
    }
    
  }

  return (
    <div className="App">
      <div style={{marginBottom: '10px'}}>
        { account.address 
          ? <>                                                              
              <div>Wallet Accounts: {account.address}</div>
              <div>Wallet Balance: {formatBalance(account.balance)}</div>                    
            </>
          : <Button type="primary" onClick={handleConnect}>Connect MetaMask</Button>
        }
      </div>
    </div>
  )
}

export default Info