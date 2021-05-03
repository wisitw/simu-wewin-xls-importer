import { Layout, Button, Descriptions, PageHeader, Spin, Tag, Popover, Select, Input, InputNumber, Tabs, Typography, Row, Col, Card, Space } from "antd";
import {
  ContactsOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";
import ReactJson from 'react-json-view'
import { useDispatch, useSelector } from "react-redux";

const { Content, Footer } = Layout;
const GOOGLE_SHEET_ID = "1vFvsNWBOu7_ic9xjN1XmdLCIh95mF_kCAS4CMB4Nfb0";
const GOOGLE_API_KEY = "AIzaSyBL8HaJ1mk3ZxP-WmmVLIPUu-Hb6Rf9hQU";
const fields = {
  "id": "หมายเลขการบริจาค",
  "slip": "URL สลิปโอนเงิน",
  "amount": "จำนวนเงิน",
  "date": "วันที่โอน",
  "time": "เวลาที่โอน",
  "fname": "ชื่อจริง",
  "lname": "นามสกุล",
  "bdate": "วัน เดือน ปี เกิด",
  "phone": "เบอร์โทรศัพท์",
  "address": "ที่อยู่"
};

const Page = () => {
  const dp = useDispatch();
  const { setting } = useSelector(st => st)
  const [l, setLoad] = useState(false)
  const [doc, updateDoc] = useState(undefined)
  const [activeTab, updateActiveTab] = useState("docs")
  const [sheet, updateSheet] = useState([])
  const [data, updateData] = useState(undefined)
  const [renderData, updateRenderData] = useState([])
  const [settings, updateSettings] = useState(setting.settings)
  const [workingSheet, selectSheet] = useState(undefined)
  const [renderFrom, setRenderFrom] = useState(undefined)
  const [renderTo, setRenderTo] = useState(undefined)
  const loadData = async () => {
    updateData(undefined)
    updateRenderData([])
    updateSheet([])
    updateDoc(undefined)
    selectSheet(undefined)
    updateActiveTab("docs")
    setLoad(true)
    const dd = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
    dd.useApiKey(GOOGLE_API_KEY);
    await dd.loadInfo(); // loads document properties and worksheets
    updateDoc({
      title: dd.title,
      id: dd.spreadsheetId
    });
    updateSheet(dd.sheetsByIndex.map(a => { return {_id: a.sheetId, title:a.title, idx: a.index, rows: a.rowCount, cols: a.columnCount, frzRw: a._rawProperties.gridProperties.frozenRowCount || 0, hidden:a.hidden} }))
    selectSheet(undefined)
    setLoad(false)
  }
  const drawList = () => {
    if(!sheet[workingSheet] || !data.items) return;
    var head = sheet[workingSheet].frzRw || 0;
    var d = data.items.slice(head+renderFrom-1, renderTo+head);
    var render = d.map(it => {
      var r = {...fields};
      Object.keys(r).forEach((k) => {
        r[k] = it[settings[k]];
      })
      return r;
    })
    updateRenderData(render)
  }
  const readData = async () => {
    if(workingSheet === undefined) return;
    setLoad(true)
    updateData(undefined)
    const dd = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
    dd.useApiKey(GOOGLE_API_KEY);
    await dd.loadInfo(); // loads document properties and worksheets
    const sht = sheet[workingSheet];
    const worksheet = dd.sheetsByIndex[workingSheet]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    await worksheet.loadCells();
    var rawData = [], row = [], empt = 0;
    for(var r = 0;r<sht.rows;r++) {
      row = [];
      empt = 0;
      for(var c = 0;c<sht.cols;c++) {
        var cell = worksheet.getCell(r,c);
        var fullVal = {
          v:cell.value,
          t:cell.valueType,
          s:cell.formula,
          f:cell.formattedValue,
          l:cell.hyperlink,
          a:cell.a1Address
        }
        row.push(fullVal.f);
        if(fullVal.f === null) empt++;
      } 
      if(empt < sht.cols) rawData.push(row);
    }
    updateData({ items: rawData })
    setRenderFrom(1);
    setRenderTo(rawData.length-sht.frzRw)
    setLoad(false)
  }
  const updateSetting = (key,val) => {
    updateSettings(p => { return {...p,[key]:val}; })
  }
  const num2A1 = (num) => {
    var s = '', t;
    while (num > 0) {
      t = (num - 1) % 26;
      s = String.fromCharCode(65 + t) + s;
      num = (num - t)/26 | 0;
    }
    return s || undefined;
  }
  
  useEffect(() => { loadData(); }, [])
  useEffect(() => { readData(); }, [workingSheet])
  useEffect(() => { updateRenderData([]); dp({ type:"UPDATE_SETTING", data:{settings:settings}})}, [settings])
  useEffect(() => { updateRenderData([]); dp({ type:"UPDATE_SETTING", data:{renderFrom:renderFrom}})}, [renderFrom])
  useEffect(() => { updateRenderData([]); dp({ type:"UPDATE_SETTING", data:{renderTo:renderTo}})}, [renderTo])

  const colsSelect = workingSheet !== undefined ? Array(sheet[workingSheet].cols) : [];
  
  const previewText = (keys, i) => {
    const lenlim = 20;
    const colors = ["#e6f7ff", "#d9d9d9", "#f0f0f0", "#f5f5f5", "#fafafa"];
    if(!data || data.items.length === 0) return;
    return keys.map((x, j) => {
      var col = colors[j%colors.length];
      var text = data.items[x][i];
      if(!text) return null;
      var l = text.length;
      return <Tag key={"D"+j} style={{ color:"#434343" }} color={col}>{l > lenlim+3 ? text.substr(0, lenlim)+"...":text}</Tag>;
    })
  }
  return (
    <Layout className="layout">
      <Content
        style={{
          margin: "0 auto",
          width: "100%",
        }}
      >
        <PageHeader
          ghost={false}
          backIcon={l?<Spin />:<ContactsOutlined />}
          onBack={() => {}}
          title="Data Processor"
          subTitle="SiMU WEWIN Project"
          extra={[
            <Button onClick={loadData} key="3">Reload Document</Button>,
            <Button onClick={readData} key="2">ReScan Sheet</Button>,
            <Button onClick={drawList} disabled={workingSheet === undefined} key="1" type="primary">Render Data</Button>,
          ]}
        >
          <Tabs activeKey={activeTab} onChange={updateActiveTab}>
            <Tabs.TabPane tab="Document Settings" key="docs">
              {doc !== undefined ? <Descriptions size="small" column={3}>
                <Descriptions.Item label="ชื่อแผ่นงาน"><Popover content={doc.id}>{doc.title}</Popover></Descriptions.Item>
                <Descriptions.Item label="จำนวนชีท">{sheet.length}</Descriptions.Item>
                <Descriptions.Item label="ประมวลผลชีท"><Select size="small" style={{minWidth:120}} placeholder="ยังไม่เลือก" value={workingSheet} onChange={selectSheet}>
                  {sheet.map(s => <Select.Option disabled={s.hidden===true} key={s._id} value={s.idx}>{s.title}</Select.Option>)}
                </Select></Descriptions.Item>
                <Descriptions.Item label="จำนวนแถว">{workingSheet !== undefined ? sheet[workingSheet].rows : "N/A"}</Descriptions.Item>
                <Descriptions.Item label="แถวที่ถูกตรึง">{workingSheet !== undefined ? sheet[workingSheet].frzRw : "N/A"}</Descriptions.Item>
                <Descriptions.Item label="จำนวนคอลัมน์">{workingSheet !== undefined ? sheet[workingSheet].cols : "N/A"}</Descriptions.Item>
                {workingSheet !== undefined && <>
                <Descriptions.Item label="จำนวนข้อมูล">{data !== undefined ? (data.items.length-sheet[workingSheet].frzRw)+" แถว" : "กำลังโหลด..."}</Descriptions.Item>
                {data !== undefined ? <>
                <Descriptions.Item label="แสดงข้อมูลตั้งแต่รายการที่"><InputNumber size="small" value={renderFrom} onChange={setRenderFrom} min={1} max={data.items.length-1} /></Descriptions.Item>
                <Descriptions.Item label="แสดงข้อมูลถึงรายการที่"><InputNumber size="small" value={Math.max(renderTo,renderFrom)} onChange={setRenderTo} min={Math.max(1,renderFrom)} max={data.items.length} /></Descriptions.Item>
                </>:null}
                </>}
              </Descriptions>:<Spin tip="กำลังเชื่อมต่อกับ Google SpreadSheet API..." />}
            </Tabs.TabPane>
            <Tabs.TabPane disabled={data === undefined} tab="Render Options" key="display">
              <Descriptions labelStyle={{ width: 192 }} column={1} size="small" bordered>
                {Object.keys(fields).map(k => <Descriptions.Item key={k} label={fields[k]}>
                  <Select size="medium" style={{width:"100%"}} placeholder="คอลัมน์..." value={settings[k]} onChange={(v) => updateSetting(k, v)}>{[...colsSelect].map((s,i) => <Select.Option key={"col"+(i+1)} value={i}><Tag>{num2A1(i+1)}</Tag>{previewText([1,2,3,4],i)}</Select.Option>)}</Select>
                </Descriptions.Item>)}
              </Descriptions>
            </Tabs.TabPane>
          </Tabs>
        </PageHeader>
        {renderData.map((item,k) => <Slip key={"D"+k} item={item} />)}
      </Content>
      <Footer style={{ textAlign: "center" }}>
      &copy; หน่วยพิพิธภัณฑ์ศิริราช คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล
      </Footer>
      <div className="backToTop"><SettingOutlined onClick={() => window.scrollTo(0,0)} /></div>
    </Layout>
  );
};
export default Page;

const gdriveToImg = (link) => {
  // https://drive.google.com/open?id=1-mM5eAE2M5NLa98TuwouXYgDLnoRQ1nG&authuser=sirirajmuseum.info%40gmail.com&usp=drive_fs
  // https://drive.google.com/file/d/16ekyDYHW0DCtJmxtpuo-MwpCFVl_6uBd/view?usp=sharing
  var id = "";
  if(link.indexOf("?id=") !== -1) {
    var g = link.split("?id=");
    g = g[1].split("&");
    id = g[0]
  } else if(link.indexOf("file/d/") !== -1) {
    var g = link.split("file/d/");
    g = g[1].split("/");
    id = g[0]
  }
  // return id ? "https://www.googleapis.com/drive/v3/files/"+id+"&key="+GOOGLE_API_KEY : "https://via.placeholder.com/512x1024/fff1f0.png?text=Invalid%20URL";
  return id ? "https://drive.google.com/uc?id="+id : "https://via.placeholder.com/512x1024/fff1f0.png?text=Invalid%20URL";
}

const Slip = (props) => {
  const { item } = props;
  const vv = item.slip || "https://via.placeholder.com/512x1024/e6f7ff.png?text=No%20Slip";
  const fld = gdriveToImg(vv);
  return <div className="singlePage">
    <Row gutter={[16,32]}>
      <Col span={24}>
        <Typography.Title level={4}>ข้อมูลการรับบริจาค #{item.id}</Typography.Title>
        <Typography.Title level={3}>โครงการพวงกุญแจที่ระลึก ศิริราชร่วมใจ สู้ภัยโควิด</Typography.Title>
      </Col>
    </Row>
    <Row className="drd" gutter={[16,16]}>
      <Col xs={12} md={10} xl={8} className="dlf">
        <Card size="small" title="หลักฐานการโอนเงิน">
            <img src={fld} />
            <small>{vv}</small>
            <small>{fld}</small>
        </Card>
      </Col>
      <Col xs={12} md={14} xl={16} className="drg">
        <Descriptions labelStyle={{ width: 192 }} column={1} size="small" bordered>
          {Object.keys(fields).filter(k => ["slip","id"].indexOf(k) === -1).map(k => <Descriptions.Item key={k} label={fields[k]}>{item[k]}</Descriptions.Item>)}
        </Descriptions>
      </Col>
    </Row>
  </div>
}