library csc_picker;

import 'dart:developer';

import 'package:flutter/services.dart' show rootBundle;
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:salon_2/custom/csc_picker/dropdown_with_search.dart';
import 'package:salon_2/custom/text_field/address_text_field.dart';
import 'package:salon_2/ui/add_new_address_screen/controller/add_new_address_controller.dart';
import 'package:salon_2/custom/csc_picker/model/select_status_model.dart';
import 'package:salon_2/utils/app_asset.dart';

enum Layout { vertical, horizontal }

enum CountryFlag { showInDropDownOnly, enable, disable }

enum CscCountry {
  afghanistan,
  alandIslands,
  albania,
  algeria,
  americanSamoa,
  andorra,
  angola,
  anguilla,
  antarctica,
  antiguaAndBarbuda,
  argentina,
  armenia,
  aruba,
  australia,
  austria,
  azerbaijan,
  bahamasThe,
  bahrain,
  bangladesh,
  barbados,
  belarus,
  belgium,
  belize,
  benin,
  bermuda,
  bhutan,
  bolivia,
  bosniaAndHerzegovina,
  botswana,
  bouvetIsland,
  brazil,
  britishIndianOceanTerritory,
  brunei,
  bulgaria,
  burkinaFaso,
  burundi,
  cambodia,
  cameroon,
  canada,
  capeVerde,
  caymanIslands,
  centralAfricanRepublic,
  chad,
  chile,
  china,
  christmasIsland,
  cocosKeelingIslands,
  colombia,
  comoros,
  congo,
  congoTheDemocraticRepublicOfThe,
  cookIslands,
  costARica,
  coteDIvoireIvoryCoast,
  croatiaHrvatska,
  cuba,
  cyprus,
  czechRepublic,
  denmark,
  djibouti,
  dominica,
  dominicanRepublic,
  eastTimor,
  ecuador,
  egypt,
  elSalvador,
  equatorialGuinea,
  eritrea,
  estonia,
  ethiopia,
  falklandIslands,
  faroeIslands,
  fijiIslands,
  finland,
  france,
  frenchGuiana,
  frenchPolynesia,
  frenchSouthernTerritories,
  gabon,
  gambiaThe,
  georgia,
  germany,
  ghana,
  gibraltar,
  greece,
  greenland,
  grenada,
  guadeloupe,
  guam,
  guatemala,
  guernseyAndAlderney,
  guinea,
  guineaBissau,
  guyana,
  haiti,
  heardIslandAndMcDonaldIslands,
  honduras,
  hongKongSAR,
  hungary,
  iceland,
  india,
  indonesia,
  iran,
  iraq,
  ireland,
  israel,
  italy,
  jamaica,
  japan,
  jersey,
  jordan,
  kazakhstan,
  kenya,
  kiribati,
  koreaNorth,
  koreaSouth,
  kuwait,
  kyrgyzstan,
  laos,
  latvia,
  lebanon,
  lesotho,
  liberia,
  libya,
  liechtenstein,
  lithuania,
  luxembourg,
  macauSAR,
  macedonia,
  madagascar,
  malawi,
  malaysia,
  maldives,
  mali,
  malta,
  manIsleOf,
  marshallIslands,
  martinique,
  mauritania,
  mauritius,
  mayotte,
  mexico,
  micronesia,
  moldova,
  monaco,
  mongolia,
  montenegro,
  montserrat,
  morocco,
  mozambique,
  myanmar,
  namibia,
  nauru,
  nepal,
  bonaireSintEustatiusandSaba,
  netherlandsThe,
  newCaledonia,
  newZealand,
  nicaragua,
  niger,
  nigeria,
  niue,
  norfolkIsland,
  northernMarianaIslands,
  norway,
  oman,
  pakistan,
  palau,
  palestinianTerritoryOccupied,
  panama,
  papuanewGuinea,
  paraguay,
  peru,
  philippines,
  pitcairnIsland,
  poland,
  portugal,
  puertoRico,
  qatar,
  reunion,
  romania,
  russia,
  rwanda,
  saintHelena,
  saintKittsAndNevis,
  saintLucia,
  saintPierreandMiquelon,
  saintVincentAndTheGrenadines,
  saintBarthelemy,
  saintMartinFrenchpart,
  samoa,
  sanMarino,
  saoTomeandPrincipe,
  saudiArabia,
  senegal,
  serbia,
  seychelles,
  sierraLeone,
  singapore,
  slovakia,
  slovenia,
  solomonIslands,
  somalia,
  southAfrica,
  southGeorgia,
  southSudan,
  spain,
  sriLanka,
  sudan,
  suriname,
  svalbardAndJanMayenIslands,
  swaziland,
  sweden,
  switzerland,
  syria,
  taiwan,
  tajikistan,
  tanzania,
  thailand,
  togo,
  tokelau,
  tonga,
  trinidadAndTobago,
  tunisia,
  turkey,
  turkmenistan,
  turksAndCaicosIslands,
  tuvalu,
  uganda,
  ukraine,
  unitedArabEmirates,
  unitedKingdom,
  unitedStates,
  unitedStatesMinorOutlyingIslands,
  uruguay,
  uzbekistan,
  vanuatu,
  vaticanCityStateHolySee,
  venezuela,
  vietnam,
  virginIslandsBritish,
  virginIslandsUS,
  wallisAndFutunaIslands,
  westernSahara,
  yemen,
  zambia,
  zimbabwe,
  kosovo,
  curacao,
  sintMaartenDutchpart
}

const Map<CscCountry, int> Countries = {
  CscCountry.afghanistan: 0,
  CscCountry.alandIslands: 1,
  CscCountry.albania: 2,
  CscCountry.algeria: 3,
  CscCountry.americanSamoa: 4,
  CscCountry.andorra: 5,
  CscCountry.angola: 6,
  CscCountry.anguilla: 7,
  CscCountry.antarctica: 8,
  CscCountry.antiguaAndBarbuda: 9,
  CscCountry.argentina: 10,
  CscCountry.armenia: 11,
  CscCountry.aruba: 12,
  CscCountry.australia: 13,
  CscCountry.austria: 14,
  CscCountry.azerbaijan: 15,
  CscCountry.bahamasThe: 16,
  CscCountry.bahrain: 17,
  CscCountry.bangladesh: 18,
  CscCountry.barbados: 19,
  CscCountry.belarus: 20,
  CscCountry.belgium: 21,
  CscCountry.belize: 22,
  CscCountry.benin: 23,
  CscCountry.bermuda: 24,
  CscCountry.bhutan: 25,
  CscCountry.bolivia: 26,
  CscCountry.bosniaAndHerzegovina: 27,
  CscCountry.botswana: 28,
  CscCountry.bouvetIsland: 29,
  CscCountry.brazil: 30,
  CscCountry.britishIndianOceanTerritory: 31,
  CscCountry.brunei: 32,
  CscCountry.bulgaria: 33,
  CscCountry.burkinaFaso: 34,
  CscCountry.burundi: 35,
  CscCountry.cambodia: 36,
  CscCountry.cameroon: 37,
  CscCountry.canada: 38,
  CscCountry.capeVerde: 39,
  CscCountry.caymanIslands: 40,
  CscCountry.centralAfricanRepublic: 41,
  CscCountry.chad: 42,
  CscCountry.chile: 43,
  CscCountry.china: 44,
  CscCountry.christmasIsland: 45,
  CscCountry.cocosKeelingIslands: 46,
  CscCountry.colombia: 47,
  CscCountry.comoros: 48,
  CscCountry.congo: 49,
  CscCountry.congoTheDemocraticRepublicOfThe: 50,
  CscCountry.cookIslands: 51,
  CscCountry.costARica: 52,
  CscCountry.coteDIvoireIvoryCoast: 53,
  CscCountry.croatiaHrvatska: 54,
  CscCountry.cuba: 55,
  CscCountry.cyprus: 56,
  CscCountry.czechRepublic: 57,
  CscCountry.denmark: 58,
  CscCountry.djibouti: 59,
  CscCountry.dominica: 60,
  CscCountry.dominicanRepublic: 61,
  CscCountry.eastTimor: 62,
  CscCountry.ecuador: 63,
  CscCountry.egypt: 64,
  CscCountry.elSalvador: 65,
  CscCountry.equatorialGuinea: 66,
  CscCountry.eritrea: 67,
  CscCountry.estonia: 68,
  CscCountry.ethiopia: 69,
  CscCountry.falklandIslands: 70,
  CscCountry.faroeIslands: 71,
  CscCountry.fijiIslands: 72,
  CscCountry.finland: 73,
  CscCountry.france: 74,
  CscCountry.frenchGuiana: 75,
  CscCountry.frenchPolynesia: 76,
  CscCountry.frenchSouthernTerritories: 77,
  CscCountry.gabon: 78,
  CscCountry.gambiaThe: 79,
  CscCountry.georgia: 80,
  CscCountry.germany: 81,
  CscCountry.ghana: 82,
  CscCountry.gibraltar: 83,
  CscCountry.greece: 84,
  CscCountry.greenland: 85,
  CscCountry.grenada: 86,
  CscCountry.guadeloupe: 87,
  CscCountry.guam: 88,
  CscCountry.guatemala: 89,
  CscCountry.guernseyAndAlderney: 90,
  CscCountry.guinea: 91,
  CscCountry.guineaBissau: 92,
  CscCountry.guyana: 93,
  CscCountry.haiti: 94,
  CscCountry.heardIslandAndMcDonaldIslands: 95,
  CscCountry.honduras: 96,
  CscCountry.hongKongSAR: 97,
  CscCountry.hungary: 98,
  CscCountry.iceland: 99,
  CscCountry.india: 100,
  CscCountry.indonesia: 101,
  CscCountry.iran: 102,
  CscCountry.iraq: 103,
  CscCountry.ireland: 104,
  CscCountry.israel: 105,
  CscCountry.italy: 106,
  CscCountry.jamaica: 107,
  CscCountry.japan: 108,
  CscCountry.jersey: 109,
  CscCountry.jordan: 110,
  CscCountry.kazakhstan: 111,
  CscCountry.kenya: 112,
  CscCountry.kiribati: 113,
  CscCountry.koreaNorth: 114,
  CscCountry.koreaSouth: 115,
  CscCountry.kuwait: 116,
  CscCountry.kyrgyzstan: 117,
  CscCountry.laos: 118,
  CscCountry.latvia: 119,
  CscCountry.lebanon: 120,
  CscCountry.lesotho: 121,
  CscCountry.liberia: 122,
  CscCountry.libya: 123,
  CscCountry.liechtenstein: 124,
  CscCountry.lithuania: 125,
  CscCountry.luxembourg: 126,
  CscCountry.macauSAR: 127,
  CscCountry.macedonia: 128,
  CscCountry.madagascar: 129,
  CscCountry.malawi: 130,
  CscCountry.malaysia: 131,
  CscCountry.maldives: 132,
  CscCountry.mali: 133,
  CscCountry.malta: 134,
  CscCountry.manIsleOf: 135,
  CscCountry.marshallIslands: 136,
  CscCountry.martinique: 137,
  CscCountry.mauritania: 138,
  CscCountry.mauritius: 139,
  CscCountry.mayotte: 140,
  CscCountry.mexico: 141,
  CscCountry.micronesia: 142,
  CscCountry.moldova: 143,
  CscCountry.monaco: 144,
  CscCountry.mongolia: 145,
  CscCountry.montenegro: 146,
  CscCountry.montserrat: 147,
  CscCountry.morocco: 148,
  CscCountry.mozambique: 149,
  CscCountry.myanmar: 150,
  CscCountry.namibia: 151,
  CscCountry.nauru: 152,
  CscCountry.nepal: 153,
  CscCountry.bonaireSintEustatiusandSaba: 154,
  CscCountry.netherlandsThe: 155,
  CscCountry.newCaledonia: 156,
  CscCountry.newZealand: 157,
  CscCountry.nicaragua: 158,
  CscCountry.niger: 159,
  CscCountry.nigeria: 160,
  CscCountry.niue: 161,
  CscCountry.norfolkIsland: 162,
  CscCountry.northernMarianaIslands: 163,
  CscCountry.norway: 164,
  CscCountry.oman: 165,
  CscCountry.pakistan: 166,
  CscCountry.palau: 167,
  CscCountry.palestinianTerritoryOccupied: 168,
  CscCountry.panama: 169,
  CscCountry.papuanewGuinea: 170,
  CscCountry.paraguay: 171,
  CscCountry.peru: 172,
  CscCountry.philippines: 173,
  CscCountry.pitcairnIsland: 174,
  CscCountry.poland: 175,
  CscCountry.portugal: 176,
  CscCountry.puertoRico: 177,
  CscCountry.qatar: 178,
  CscCountry.reunion: 179,
  CscCountry.romania: 180,
  CscCountry.russia: 181,
  CscCountry.rwanda: 182,
  CscCountry.saintHelena: 183,
  CscCountry.saintKittsAndNevis: 184,
  CscCountry.saintLucia: 185,
  CscCountry.saintPierreandMiquelon: 186,
  CscCountry.saintVincentAndTheGrenadines: 187,
  CscCountry.saintBarthelemy: 188,
  CscCountry.saintMartinFrenchpart: 189,
  CscCountry.samoa: 190,
  CscCountry.sanMarino: 191,
  CscCountry.saoTomeandPrincipe: 192,
  CscCountry.saudiArabia: 193,
  CscCountry.senegal: 194,
  CscCountry.serbia: 195,
  CscCountry.seychelles: 196,
  CscCountry.sierraLeone: 197,
  CscCountry.singapore: 198,
  CscCountry.slovakia: 199,
  CscCountry.slovenia: 200,
  CscCountry.solomonIslands: 201,
  CscCountry.somalia: 202,
  CscCountry.southAfrica: 203,
  CscCountry.southGeorgia: 204,
  CscCountry.southSudan: 205,
  CscCountry.spain: 206,
  CscCountry.sriLanka: 207,
  CscCountry.sudan: 208,
  CscCountry.suriname: 209,
  CscCountry.svalbardAndJanMayenIslands: 210,
  CscCountry.swaziland: 211,
  CscCountry.sweden: 212,
  CscCountry.switzerland: 213,
  CscCountry.syria: 214,
  CscCountry.taiwan: 215,
  CscCountry.tajikistan: 216,
  CscCountry.tanzania: 217,
  CscCountry.thailand: 218,
  CscCountry.togo: 219,
  CscCountry.tokelau: 220,
  CscCountry.tonga: 221,
  CscCountry.trinidadAndTobago: 222,
  CscCountry.tunisia: 223,
  CscCountry.turkey: 224,
  CscCountry.turkmenistan: 225,
  CscCountry.turksAndCaicosIslands: 226,
  CscCountry.tuvalu: 227,
  CscCountry.uganda: 228,
  CscCountry.ukraine: 229,
  CscCountry.unitedArabEmirates: 230,
  CscCountry.unitedKingdom: 231,
  CscCountry.unitedStates: 232,
  CscCountry.unitedStatesMinorOutlyingIslands: 233,
  CscCountry.uruguay: 234,
  CscCountry.uzbekistan: 235,
  CscCountry.vanuatu: 236,
  CscCountry.vaticanCityStateHolySee: 237,
  CscCountry.venezuela: 238,
  CscCountry.vietnam: 239,
  CscCountry.virginIslandsBritish: 240,
  CscCountry.virginIslandsUS: 241,
  CscCountry.wallisAndFutunaIslands: 242,
  CscCountry.westernSahara: 243,
  CscCountry.yemen: 244,
  CscCountry.zambia: 245,
  CscCountry.zimbabwe: 246,
  CscCountry.kosovo: 247,
  CscCountry.curacao: 248,
  CscCountry.sintMaartenDutchpart: 249,
};

class CSCPicker extends StatefulWidget {
  final ValueChanged<String>? onCountryChanged;
  final ValueChanged<String?>? onStateChanged;
  final ValueChanged<String?>? onCityChanged;
  final String? currentCountry;
  final String? currentState;
  final String? currentCity;
  final bool disableCountry;
  final TextStyle? selectedItemStyle, dropdownHeadingStyle, dropdownItemStyle;
  final BoxDecoration? dropdownDecoration, disabledDropdownDecoration;
  final bool showStates, showCities;
  final CountryFlag flagState;
  final Layout layout;
  final double? searchBarRadius;
  final double? dropdownDialogRadius;
  final CscCountry? defaultCountry;
  final String countrySearchPlaceholder;
  final String stateSearchPlaceholder;
  final String citySearchPlaceholder;
  final String countryDropdownLabel;
  final String stateDropdownLabel;
  final String cityDropdownLabel;
  final List<CscCountry>? countryFilter;

  const CSCPicker({
    super.key,
    this.onCountryChanged,
    this.onStateChanged,
    this.onCityChanged,
    this.selectedItemStyle,
    this.dropdownHeadingStyle,
    this.dropdownItemStyle,
    this.dropdownDecoration,
    this.disabledDropdownDecoration,
    this.searchBarRadius,
    this.dropdownDialogRadius,
    this.flagState = CountryFlag.enable,
    this.layout = Layout.horizontal,
    this.showStates = true,
    this.showCities = true,
    this.defaultCountry,
    this.currentCountry,
    this.currentState,
    this.currentCity,
    this.disableCountry = false,
    this.countrySearchPlaceholder = "Search Country",
    this.stateSearchPlaceholder = "Search State",
    this.citySearchPlaceholder = "Search City",
    this.countryDropdownLabel = "Country",
    this.stateDropdownLabel = "State",
    this.cityDropdownLabel = "City",
    this.countryFilter,
  });

  @override
  CSCPickerState createState() => CSCPickerState();
}

class CSCPickerState extends State<CSCPicker> {
  List<String?> citie = [];
  List<String?> country = [];
  List<String?> state = [];
  List<CscCountry> _countryFilter = CscCountry.values;

  String _selectedCity = 'City';
  String? _selectedCountry;
  String _selectedState = 'State';
  dynamic responses;

  @override
  void initState() {
    super.initState();
    setDefaults();
    if (widget.countryFilter != null) {
      _countryFilter = widget.countryFilter!;
    }
    getCountries();
    _selectedCity = widget.cityDropdownLabel;
    _selectedState = widget.stateDropdownLabel;
  }

  Future<void> setDefaults() async {
    if (widget.currentCountry != null) {
      setState(() => _selectedCountry = widget.currentCountry);
      await getStates();
    }

    if (widget.currentState != null) {
      setState(() => _selectedState = widget.currentState!);
      await getCities();
    }

    if (widget.currentCity != null) {
      setState(() => _selectedCity = widget.currentCity!);
    }
  }

  void _setDefaultCountry() {
    if (widget.defaultCountry != null) {
      log("Country in default country :: ${country[Countries[widget.defaultCountry]!]}");
      _onSelectedCountry(country[Countries[widget.defaultCountry]!]!);
    }
  }

  ///Read JSON country data from assets
  Future<dynamic> getResponse() async {
    // var res = await rootBundle.loadString('packages/csc_picker/lib/assets/country.json');
    var res = await rootBundle.loadString(AppAsset.imCountryJson);
    return jsonDecode(res);
  }

  ///get countries from json response
  Future<List<String?>> getCountries() async {
    country.clear();
    var countries = await getResponse() as List;
    if (_countryFilter.isNotEmpty) {
      for (var element in _countryFilter) {
        var result = countries[Countries[element]!];
        if (result != null) addCountryToList(result);
      }
    } else {
      for (var data in countries) {
        addCountryToList(data);
      }
    }
    _setDefaultCountry();
    return country;
  }

  ///Add a country to country list
  void addCountryToList(data) {
    var model = Country();
    model.name = data['name'];
    model.emoji = data['emoji'];
    if (!mounted) return;
    setState(() {
      widget.flagState == CountryFlag.enable || widget.flagState == CountryFlag.showInDropDownOnly
          ? country.add("${model.emoji!}    ${model.name!}")
          : country.add(model.name);
    });
  }

  ///get states from json response
  Future<List<String?>> getStates() async {
    state.clear();
    //log(_selectedCountry);
    var response = await getResponse();
    var takeState = widget.flagState == CountryFlag.enable || widget.flagState == CountryFlag.showInDropDownOnly
        ? response
            .map((map) => Country.fromJson(map))
            .where((item) => item.emoji + "    " + item.name == _selectedCountry)
            .map((item) => item.state)
            .toList()
        : response
            .map((map) => Country.fromJson(map))
            .where((item) => item.name == _selectedCountry)
            .map((item) => item.state)
            .toList();
    var states = takeState as List;
    for (var f in states) {
      if (!mounted) continue;
      setState(() {
        var name = f.map((item) => item.name).toList();
        for (var stateName in name) {
          //log(stateName.toString());
          state.add(stateName.toString());
        }
      });
    }
    state.sort((a, b) => a!.compareTo(b!));
    return state;
  }

  ///get cities from json response
  Future<List<String?>> getCities() async {
    citie.clear();
    var response = await getResponse();
    var takeCity = widget.flagState == CountryFlag.enable || widget.flagState == CountryFlag.showInDropDownOnly
        ? response
            .map((map) => Country.fromJson(map))
            .where((item) => item.emoji + "    " + item.name == _selectedCountry)
            .map((item) => item.state)
            .toList()
        : response
            .map((map) => Country.fromJson(map))
            .where((item) => item.name == _selectedCountry)
            .map((item) => item.state)
            .toList();
    var cities = takeCity as List;
    for (var f in cities) {
      var name = f.where((item) => item.name == _selectedState);
      var cityName = name.map((item) => item.city).toList();
      cityName.forEach((ci) {
        if (!mounted) return;
        setState(() {
          var citiesName = ci.map((item) => item.name).toList();
          for (var cityName in citiesName) {
            citie.add(cityName.toString());
          }
        });
      });
    }
    citie.sort((a, b) => a!.compareTo(b!));
    return citie;
  }

  void _onSelectedCountry(String value) {
    if (!mounted) return;
    setState(() {
      if (widget.flagState == CountryFlag.showInDropDownOnly) {
        try {
          widget.onCountryChanged!(value.substring(6).trim());
        } catch (e) {
          log("Error in selected country :: $e");
        }
      } else {
        widget.onCountryChanged!(value);
      }
      if (value != _selectedCountry) {
        state.clear();
        citie.clear();
        _selectedState = widget.stateDropdownLabel;
        _selectedCity = widget.cityDropdownLabel;
        widget.onStateChanged!(null);
        widget.onCityChanged!(null);
        _selectedCountry = value;
        getStates();
      } else {
        widget.onStateChanged!(_selectedState);
        widget.onCityChanged!(_selectedCity);
      }
    });
  }

  void _onSelectedState(String value) {
    if (!mounted) return;
    setState(() {
      widget.onStateChanged!(value);
      if (value != _selectedState) {
        citie.clear();
        _selectedCity = widget.cityDropdownLabel;
        widget.onCityChanged!(null);
        _selectedState = value;
        getCities();
      } else {
        widget.onCityChanged!(_selectedCity);
      }
    });
  }

  void _onSelectedCity(String value) {
    if (!mounted) return;
    setState(() {
      if (value != _selectedCity) {
        _selectedCity = value;
        widget.onCityChanged!(value);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        widget.layout == Layout.vertical
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  countryDropdown(),
                  const SizedBox(height: 10.0),
                  stateDropdown(),
                  const SizedBox(height: 10.0),
                  cityDropdown()
                ],
              )
            : Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Expanded(child: countryDropdown()),
                      widget.showStates ? const SizedBox(width: 10.0) : Container(),
                      widget.showStates ? Expanded(child: stateDropdown()) : Container(),
                    ],
                  ),
                  const SizedBox(height: 25),
                  Row(
                    children: [
                      widget.showStates && widget.showCities ? Expanded(child: cityDropdown()) : Container(),
                      widget.showStates ? const SizedBox(width: 10.0) : Container(),
                      Expanded(
                        child: GetBuilder<AddNewAddressController>(
                          builder: (logic) {
                            return AddressTextField(
                              labelText: "Pin Code",
                              controller: logic.zipCodeController,
                              keyboardType: TextInputType.number,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return "Please enter pincode";
                                }
                                return null;
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  )
                ],
              ),
      ],
    );
  }

  ///filter Country Data according to user input
  Future<List<String?>> getCountryData(filter) async {
    var filteredList = country
        .where(
          (country) => country!.toLowerCase().contains(filter.toLowerCase()),
        )
        .toList();
    if (filteredList.isEmpty) {
      return country;
    } else {
      return filteredList;
    }
  }

  ///filter Sate Data according to user input
  Future<List<String?>> getStateData(filter) async {
    var filteredList = state
        .where(
          (state) => state!.toLowerCase().contains(filter.toLowerCase()),
        )
        .toList();
    if (filteredList.isEmpty) {
      return state;
    } else {
      return filteredList;
    }
  }

  ///filter City Data according to user input
  Future<List<String?>> getCityData(filter) async {
    var filteredList = citie
        .where(
          (city) => city!.toLowerCase().contains(filter.toLowerCase()),
        )
        .toList();
    if (filteredList.isEmpty) {
      return citie;
    } else {
      return filteredList;
    }
  }

  ///Country Dropdown Widget
  Widget countryDropdown() {
    return DropdownWithSearch(
      title: widget.countryDropdownLabel,
      placeHolder: widget.countrySearchPlaceholder,
      selectedItemStyle: widget.selectedItemStyle,
      dropdownHeadingStyle: widget.dropdownHeadingStyle,
      decoration: widget.dropdownDecoration,
      disabledDecoration: widget.disabledDropdownDecoration,
      disabled: country.isEmpty || widget.disableCountry ? true : false,
      dialogRadius: widget.dropdownDialogRadius,
      searchBarRadius: widget.searchBarRadius,
      label: widget.countrySearchPlaceholder,
      items: country.map((String? dropDownStringItem) {
        return dropDownStringItem;
      }).toList(),
      selected: _selectedCountry ?? widget.countryDropdownLabel,
      onChanged: (value) {
        log("countryChanged $value $_selectedCountry");
        if (value != null) {
          _onSelectedCountry(value);
        }
      },
    );
  }

  ///State Dropdown Widget
  Widget stateDropdown() {
    return DropdownWithSearch(
      title: widget.stateDropdownLabel,
      placeHolder: widget.stateSearchPlaceholder,
      disabled: state.isEmpty ? true : false,
      items: state.map((String? dropDownStringItem) {
        return dropDownStringItem;
      }).toList(),
      selectedItemStyle: widget.selectedItemStyle,
      dropdownHeadingStyle: widget.dropdownHeadingStyle,
      decoration: widget.dropdownDecoration,
      dialogRadius: widget.dropdownDialogRadius,
      searchBarRadius: widget.searchBarRadius,
      disabledDecoration: widget.disabledDropdownDecoration,
      selected: _selectedState,
      label: widget.stateSearchPlaceholder,
      onChanged: (value) {
        value != null ? _onSelectedState(value) : _onSelectedState(_selectedState);
      },
    );
  }

  ///City Dropdown Widget
  Widget cityDropdown() {
    return DropdownWithSearch(
      title: widget.cityDropdownLabel,
      placeHolder: widget.citySearchPlaceholder,
      disabled: citie.isEmpty ? true : false,
      items: citie.map((String? dropDownStringItem) {
        return dropDownStringItem;
      }).toList(),
      selectedItemStyle: widget.selectedItemStyle,
      dropdownHeadingStyle: widget.dropdownHeadingStyle,
      decoration: widget.dropdownDecoration,
      dialogRadius: widget.dropdownDialogRadius,
      searchBarRadius: widget.searchBarRadius,
      disabledDecoration: widget.disabledDropdownDecoration,
      selected: _selectedCity,
      label: widget.citySearchPlaceholder,
      onChanged: (value) {
        value != null ? _onSelectedCity(value) : _onSelectedCity(_selectedCity);
      },
    );
  }
}
