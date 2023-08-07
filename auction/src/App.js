import { Layout, message, theme, ConfigProvider  } from 'antd';
import React, { useState, createContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import './App.css'

import All from './routes/AllItems'
import My from './routes/MyItems'
import MyInvestment from './routes/MyInvestment'

import Header from './components/Header'
import Footer from './components/Footer'

const { Content } = Layout;

export const AccountContext = createContext()

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState(localStorage.getItem('account') ? JSON.parse(localStorage.getItem('account')) : {}) 
  const { token: { colorBgContainer } } = theme.useToken();

  const navigate = useNavigate()

  useEffect(() => {
    const accountChange = (accounts) => {
      if (accounts[0] !== account.address) {
        message.warning('please reconnect the new account')
        setAccount({})
        navigate('/all')
      }
    }
    window.ethereum.on('accountsChanged',accountChange)
    return () => window.ethereum.removeListener('accountsChanged', accountChange)
  }, [])

  return (
    <AccountContext.Provider value={[account, setAccount]}>
       <ConfigProvider
          theme={{
            token: {
              colorBgLayout: '#001529',
            },
          }}
        >
      <Layout style={{width: "100%", height: "100%"}}>
        <Layout>
          <Header colorBgContainer={colorBgContainer} collapsed={collapsed} setCollapsed={setCollapsed} />
          
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              overflow: 'auto'
            }}
          >
            <Routes>
                <Route path="/all" element={<All />} />
                <Route path="/my" element={<My />} />
                <Route path="/myInvestment" element={<MyInvestment />} />
                {/* 设置默认路由 */}
                <Route path="*" element={<Navigate to="/all" replace />} />
            </Routes>
          </Content>

          <Footer />
        </Layout>
      </Layout>
      </ConfigProvider>
    </AccountContext.Provider>
  );
};
export default App;