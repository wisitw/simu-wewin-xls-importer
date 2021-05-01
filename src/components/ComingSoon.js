import React, { useEffect } from 'react'
import { Empty } from 'antd';

const ComingSoon = (props) => {

  useEffect(() => {
  }, [])

  return (
    <div style={{ textAlign:"center", maxWidth:350, width:"90%", margin:"20% auto 5%" }}>
      <h2>อดใจรออีกนิด...</h2>
      <Empty description="ฟีเจอร์นี้กำลังอยู่ระหว่างพัฒนา เพื่อให้ท่านได้ใช้งานอย่างมีประสิทธิภาพ แล้วพบกัน อีกไม่นานเกินรอ" />
    </div>
  );
}


export default ComingSoon;