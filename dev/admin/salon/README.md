# Multisalon-salonpanel

કોમ્પોનેન્ટ્સ અને ફાઈલ્સ કનેક્શન:
// રિએક્ટ-રિડક્સ કનેક્શન્સ
import { useDispatch, useSelector } from "react-redux";
import { getParticularSalonService } from "../../../redux/slice/serviceSlice";
import Multiselect from "multiselect-react-dropdown";

ડેટા ફ્લો:
// રિડક્સ સ્ટોરમાંથી ડેટા મેળવવો
const { particularService } = useSelector((state) => state.service);

// સર્વિસ લિસ્ટ બનાવવી
const serviceList = particularService?.map((list) => ({
  name: list?.id?.name,
  id: list?.id?._id,
}));

// એડિટ કેસમાં પહેલાથી સિલેક્ટેડ સર્વિસીસ
const select = state?.row?.serviceData
  ? state?.row?.serviceData?.map((item) => ({
      id: item?._id,
      name: item?.name,
    }))
  : state?.row?.serviceId?.map((item) => ({
      id: item?._id,
      name: item?.name,
    }));


 સર્વિસ સિલેક્શન ફ્લો:
   // જ્યારે નવી સર્વિસ સિલેક્ટ થાય
function onSelect(selectedList, selectedItem) {
  const updatedServices = 
    allService !== undefined 
      ? [...allService, selectedItem] 
      : [selectedItem];
  setAllService(updatedServices);
}

// જ્યારે સર્વિસ રિમૂવ થાય
function onRemove(selectedList, removedItem) {
  const updatedServices = selectedList?.filter(
    (item) => item.id !== removedItem.id
  );
  setAllService(updatedServices);
}

કોમ્પોનેન્ટ રેન્ડરિંગ ફ્લો
<div className="row my-2">
  {/* લેબલ */}
  <div className="inputData text flex-row justify-content-start text-start">
    <label for="fname" class="false">
      Select services
    </label>
  </div>
  
  {/* મલ્ટીસિલેક્ટ ડ્રોપડાઉન */}
  <Multiselect
    options={serviceList}        // બધી સર્વિસીસની લિસ્ટ
    selectedValues={select}      // પહેલાથી સિલેક્ટેડ સર્વિસીસ
    hideOnClickOutside={false}   // બહાર ક્લિક કરવાથી બંધ ન થાય
    onSelect={onSelect}          // સિલેક્ટ થાય ત્યારે
    onRemove={onRemove}          // રિમૂવ થાય ત્યારે
    displayValue="name"          // દેખાડવાનું ફીલ્ડ
  />
  
  {/* એરર મેસેજ */}
  {error.allService && (
    <p className="errorMessage">{error?.allService}</p>
  )}
</div>

ડેટા સબમિશન ફ્લો:
// વેલિડેશન
if (!allService?.length) {
  error.allService = "At least one service must be selected";
}

// ફોર્મ સબમિટ થાય ત્યારે
const handleSubmit = async (e) => {
  // સર્વિસ IDs ને કોમા સેપરેટેડ સ્ટ્રિંગમાં કન્વર્ટ
  const serviceIds = allService?.map((service) => service.id)?.join(",");
  formData.append("serviceId", serviceIds);
  
  // API કૉલ
  if (mongoId) {
    dispatch(expertUpdate({ formData, expertId: mongoId }));
  } else {
    dispatch(expertAdd(formData));
  }
}

અન્ય કનેક્ટેડ કોમ્પોનેન્ટ્સ:
redux/slice/serviceSlice.js - સર્વિસ ડેટા મેનેજમેન્ટ
redux/api.js - API કૉલ્સ
redux/slice/expertSlice.js - એક્સપર્ટ ડેટા મેનેજમેન્ટ
7. ડેટા ફ્લો સ્ટેપ્સ:
=કોમ્પોનેન્ટ લોડ થાય
=getParticularSalonService API કૉલ થાય
=સર્વિસ લિસ્ટ મળે અને ડ્રોપડાઉનમાં દેખાય
=યુઝર સર્વિસ સિલેક્ટ/રિમૂવ કરે
=allService સ્ટેટ અપડેટ થાય
=ફોર્મ સબમિટ થાય ત્યારે સર્વિસ IDs API ને મોકલાય
આ કોમ્પોનેન્ટ એક્સપર્ટને કઈ કઈ સર્વિસ આપવી છે તે સિલેક્ટ કરવા માટે વપરાય છે અને એક્સપર્ટના ડેટા સાથે બેકએન્ડમાં સેવ થાય છે.
