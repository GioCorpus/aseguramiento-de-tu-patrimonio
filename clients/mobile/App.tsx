import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';

const { width } = Dimensions.get('window');

// Premium HSL Color Palette
const COLORS = {
  bgDeep: '#020617',     // Slate 950
  bgSlate: '#0f172a',    // Slate 900
  bgCard: '#1e293b',     // Slate 800
  border: '#334155',     // Slate 700
  textMuted: '#94a3b8',  // Slate 400
  textLight: '#f8fafc',  // Slate 50
  primary: '#2563eb',    // Royal Blue
  primaryLight: '#60a5fa',
  accent: '#06b6d4',     // Cyan
  accentGlow: 'rgba(6, 182, 212, 0.15)',
  success: '#10b981',    // Emerald Green
  warning: '#f59e0b',    // Amber
  danger: '#ef4444',     // Red
};

interface Vehicle {
  id: string;
  vin: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
}

interface Permit {
  id: string;
  vehicleId: string;
  type: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  cost: number;
  qrCode: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'dashboard' | 'register_vehicle' | 'request_permit' | 'ocr_scan' | 'payment_checkout'>('onboarding');
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      vin: '3HGEC826XLGXXXXXX',
      plate: 'PXY-982-A',
      brand: 'Honda',
      model: 'Civic',
      year: '2020',
      color: 'Gris Plata',
    }
  ]);
  const [permits, setPermits] = useState<Permit[]>([
    {
      id: 'PM-87241',
      vehicleId: '1',
      type: 'Circulación Temporal',
      status: 'active',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      cost: 450,
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PM-87241-VERIFIED',
    }
  ]);

  // Form states
  const [vinInput, setVinInput] = useState('');
  const [plateInput, setPlateInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  // Permit Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState('1');
  const [selectedPermitType, setSelectedPermitType] = useState('circulacion');
  const [durationDays, setDurationDays] = useState('30');
  const [estimatedCost, setEstimatedCost] = useState(450);

  // Active items for Checkout
  const [pendingPermit, setPendingPermit] = useState<Permit | null>(null);

  // OCR state simulation
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Live calculator when form changes
  useEffect(() => {
    let basePrice = 15; // Price per day
    if (selectedPermitType === 'remolque') basePrice = 25;
    if (selectedPermitType === 'especial') basePrice = 40;
    
    const days = parseInt(durationDays) || 1;
    setEstimatedCost(basePrice * days);
  }, [selectedPermitType, durationDays]);

  // Handle OCR scanning simulation
  const startOCRScan = () => {
    setOcrScanning(true);
    setOcrProgress(0);
    const interval = setInterval(() => {
      setOcrProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setOcrScanning(false);
            // Autofill with mock OCR data
            setVinInput('1HGCR2F8XJAXXXXXX');
            setPlateInput('NMX-431-B');
            setBrandInput('Toyota');
            setModelInput('Prius');
            setYearInput('2021');
            setColorInput('Azul Eléctrico');
            Alert.alert('OCR Completado', 'Se han extraído los datos de la tarjeta de circulación correctamente.');
            setCurrentScreen('register_vehicle');
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleRegisterVehicle = () => {
    if (!vinInput || !plateInput || !brandInput || !modelInput) {
      Alert.alert('Error', 'Por favor llena los campos obligatorios.');
      return;
    }
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      vin: vinInput,
      plate: plateInput,
      brand: brandInput,
      model: modelInput,
      year: yearInput || '2022',
      color: colorInput || 'Negro',
    };
    setVehicles([...vehicles, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    Alert.alert('Éxito', 'Vehículo registrado correctamente.');
    // Reset forms
    setVinInput('');
    setPlateInput('');
    setBrandInput('');
    setModelInput('');
    setYearInput('');
    setColorInput('');
    setCurrentScreen('dashboard');
  };

  const handleRequestPermit = () => {
    const days = parseInt(durationDays) || 30;
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    const formatYMD = (date: Date) => date.toISOString().split('T')[0];

    const typeLabel = 
      selectedPermitType === 'circulacion' ? 'Circulación Temporal' :
      selectedPermitType === 'remolque' ? 'Remolque Vehicular' : 'Permiso Especial';

    const newPermit: Permit = {
      id: `PM-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleId: selectedVehicleId,
      type: typeLabel,
      status: 'pending',
      startDate: formatYMD(start),
      endDate: formatYMD(end),
      cost: estimatedCost,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PM-PENDING`,
    };

    setPermits([...permits, newPermit]);
    setPendingPermit(newPermit);
    setCurrentScreen('payment_checkout');
  };

  const handleSimulatePayment = (success: boolean) => {
    if (!pendingPermit) return;

    if (success) {
      setPermits(prevPermits =>
        prevPermits.map(p =>
          p.id === pendingPermit.id
            ? { ...p, status: 'active', qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${p.id}-VERIFIED` }
            : p
        )
      );
      Alert.alert('Pago Confirmado', 'Tu pago ha sido procesado de forma segura y el permiso está activo.');
    } else {
      Alert.alert('Pago Pendiente', 'Puedes realizar tu transferencia SPEI o pago en OXXO. El permiso se activará al recibir los fondos.');
    }
    setPendingPermit(null);
    setCurrentScreen('dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoTextSymbol}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>Asegura tu Patrimonio</Text>
            <Text style={styles.logoSubtitle}>Gestión de Permisos Vehiculares</Text>
          </View>
        </View>
        {currentScreen !== 'onboarding' && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.backBtnText}>Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SCREEN 1: ONBOARDING / WELCOME */}
        {currentScreen === 'onboarding' && (
          <View style={styles.onboardingContainer}>
            <Text style={styles.onboardingEmoji}>🚗✨</Text>
            <Text style={styles.onboardingTitle}>Protege y Circula Legalmente</Text>
            <Text style={styles.onboardingDesc}>
              Gestiona permisos temporales, realiza validaciones OCR instantáneas de tus documentos y paga de forma segura en minutos.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('dashboard')}>
              <Text style={styles.primaryBtnText}>Comenzar Ahora 🛡️</Text>
            </TouchableOpacity>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📸</Text>
                <View>
                  <Text style={styles.featureTitle}>Escaneo OCR Premium</Text>
                  <Text style={styles.featureSub}>Autocompleta tu tarjeta de circulación al instante.</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚡</Text>
                <View>
                  <Text style={styles.featureTitle}>Emisión Inmediata</Text>
                  <Text style={styles.featureSub}>Permisos válidos con código QR listo para verificar.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* SCREEN 2: DASHBOARD */}
        {currentScreen === 'dashboard' && (
          <View style={styles.dashboardContainer}>
            
            {/* Header info */}
            <View style={styles.welcomeBanner}>
              <Text style={styles.welcomeText}>¡Hola de nuevo!</Text>
              <Text style={styles.welcomeSubText}>Monitorea el estado de tus vehículos y permisos.</Text>
            </View>

            {/* Action Cards Grid */}
            <View style={styles.actionGrid}>
              <TouchableOpacity style={[styles.actionCard, { borderColor: COLORS.accent }]} onPress={() => setCurrentScreen('ocr_scan')}>
                <Text style={styles.actionCardIcon}>📸</Text>
                <Text style={styles.actionCardTitle}>Escanear OCR</Text>
                <Text style={styles.actionCardSub}>Capturar tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => setCurrentScreen('register_vehicle')}>
                <Text style={styles.actionCardIcon}>➕</Text>
                <Text style={styles.actionCardTitle}>Registrar Auto</Text>
                <Text style={styles.actionCardSub}>Datos manuales</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Permit Request Button */}
            <TouchableOpacity 
              style={styles.floatingActionBtn} 
              onPress={() => {
                if (vehicles.length === 0) {
                  Alert.alert('Prerrequisito', 'Primero debes registrar un vehículo.');
                  setCurrentScreen('register_vehicle');
                } else {
                  setCurrentScreen('request_permit');
                }
              }}
            >
              <Text style={styles.floatingActionBtnText}>🎟️ Solicitar Permiso Temporal</Text>
            </TouchableOpacity>

            {/* List of Vehicles */}
            <Text style={styles.sectionTitle}>Tus Vehículos Registrados ({vehicles.length})</Text>
            {vehicles.map((v) => (
              <View key={v.id} style={styles.vehicleCard}>
                <View style={styles.vehicleCardHeader}>
                  <Text style={styles.vehicleCardTitle}>{v.brand} {v.model}</Text>
                  <Text style={styles.plateBadge}>{v.plate}</Text>
                </View>
                <Text style={styles.vehicleCardDetail}>VIN: {v.vin}</Text>
                <Text style={styles.vehicleCardDetail}>Color: {v.color} | Año: {v.year}</Text>
              </View>
            ))}

            {/* List of Permits */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Historial de Permisos ({permits.length})</Text>
            {permits.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tienes permisos emitidos aún.</Text>
              </View>
            ) : (
              permits.map((p) => {
                const vehicle = vehicles.find(v => v.id === p.vehicleId);
                return (
                  <View key={p.id} style={styles.permitCard}>
                    <View style={styles.permitCardHeader}>
                      <View>
                        <Text style={styles.permitCardTitle}>{p.type}</Text>
                        <Text style={styles.permitCardSub}>{vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : 'Vehículo Desconocido'}</Text>
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        p.status === 'active' && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: COLORS.success },
                        p.status === 'pending' && { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: COLORS.warning },
                      ]}>
                        <Text style={[
                          styles.statusText,
                          p.status === 'active' && { color: COLORS.success },
                          p.status === 'pending' && { color: COLORS.warning },
                        ]}>
                          {p.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.permitDivider} />

                    <View style={styles.permitBody}>
                      <View>
                        <Text style={styles.permitLabel}>VIGENCIA</Text>
                        <Text style={styles.permitValue}>{p.startDate} al {p.endDate}</Text>
                        <Text style={[styles.permitLabel, { marginTop: 8 }]}>COSTO DEL TRÁMITE</Text>
                        <Text style={styles.permitValue}>${p.cost} MXN</Text>
                      </View>
                      
                      {p.status === 'active' ? (
                        <View style={styles.qrContainer}>
                          <Image source={{ uri: p.qrCode }} style={styles.qrImage} />
                          <Text style={styles.qrLabel}>Autorizado 🛡️</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={styles.payNowBtn}
                          onPress={() => {
                            setPendingPermit(p);
                            setCurrentScreen('payment_checkout');
                          }}
                        >
                          <Text style={styles.payNowBtnText}>Pagar Ahora</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}

          </View>
        )}

        {/* SCREEN 3: REGISTER VEHICLE */}
        {currentScreen === 'register_vehicle' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Registrar Vehículo</Text>
            <Text style={styles.formSubtitle}>Ingresa los detalles técnicos oficiales de tu vehículo para vincular permisos.</Text>

            <TouchableOpacity style={styles.ocrQuickBtn} onPress={() => setCurrentScreen('ocr_scan')}>
              <Text style={styles.ocrQuickBtnText}>⚡ Usar Autocompletado con Cámara OCR</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Serie (VIN) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="17 caracteres alfanuméricos" 
                placeholderTextColor={COLORS.textMuted}
                value={vinInput}
                onChangeText={setVinInput}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Placa de Circulación *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej. PXY-982-A" 
                placeholderTextColor={COLORS.textMuted}
                value={plateInput}
                onChangeText={setPlateInput}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Marca *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. Honda" 
                  placeholderTextColor={COLORS.textMuted}
                  value={brandInput}
                  onChangeText={setBrandInput}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Modelo *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. Civic" 
                  placeholderTextColor={COLORS.textMuted}
                  value={modelInput}
                  onChangeText={setModelInput}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Año Modelo</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. 2021" 
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={yearInput}
                  onChangeText={setYearInput}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Color</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. Gris" 
                  placeholderTextColor={COLORS.textMuted}
                  value={colorInput}
                  onChangeText={setColorInput}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegisterVehicle}>
              <Text style={styles.submitBtnText}>Registrar Vehículo Oficial 🛡️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrentScreen('dashboard')}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SCREEN 4: REQUEST PERMIT */}
        {currentScreen === 'request_permit' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Solicitar Permiso Temporal</Text>
            <Text style={styles.formSubtitle}>Selecciona el vehículo y el tipo de vigencia para el permiso de circulación.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehículo Autorizado</Text>
              <View style={styles.pickerSimulated}>
                {vehicles.map((v) => (
                  <TouchableOpacity 
                    key={v.id} 
                    style={[
                      styles.pickerOption, 
                      selectedVehicleId === v.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setSelectedVehicleId(v.id)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedVehicleId === v.id && styles.pickerOptionTextSelected
                    ]}>
                      {v.brand} {v.model} ({v.plate})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Permiso</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={[styles.segmentBtn, selectedPermitType === 'circulacion' && styles.segmentBtnActive]}
                  onPress={() => setSelectedPermitType('circulacion')}
                >
                  <Text style={[styles.segmentBtnText, selectedPermitType === 'circulacion' && styles.segmentBtnTextActive]}>Circulación</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentBtn, selectedPermitType === 'remolque' && styles.segmentBtnActive]}
                  onPress={() => setSelectedPermitType('remolque')}
                >
                  <Text style={[styles.segmentBtnText, selectedPermitType === 'remolque' && styles.segmentBtnTextActive]}>Remolque</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentBtn, selectedPermitType === 'especial' && styles.segmentBtnActive]}
                  onPress={() => setSelectedPermitType('especial')}
                >
                  <Text style={[styles.segmentBtnText, selectedPermitType === 'especial' && styles.segmentBtnTextActive]}>Especial</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duración del Permiso (Días)</Text>
              <View style={styles.buttonGroup}>
                {['7', '15', '30', '90'].map((d) => (
                  <TouchableOpacity 
                    key={d}
                    style={[styles.dayBtn, durationDays === d && styles.dayBtnActive]}
                    onPress={() => setDurationDays(d)}
                  >
                    <Text style={[styles.dayBtnText, durationDays === d && styles.dayBtnTextActive]}>{d}d</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pricing Summary */}
            <View style={styles.priceSummaryCard}>
              <Text style={styles.priceSummaryLabel}>Costo Total Estimado</Text>
              <Text style={styles.priceSummaryValue}>${estimatedCost}.00 MXN</Text>
              <Text style={styles.priceSummaryDetail}>Válido a nivel federal para libre tránsito estatal.</Text>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRequestPermit}>
              <Text style={styles.submitBtnText}>Generar Orden de Trámite 🎟️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrentScreen('dashboard')}>
              <Text style={styles.cancelBtnText}>Regresar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SCREEN 5: CAMERA OCR SIMULATION */}
        {currentScreen === 'ocr_scan' && (
          <View style={styles.ocrContainer}>
            <Text style={styles.ocrHeadline}>Escanear Tarjeta de Circulación</Text>
            <Text style={styles.ocrDesc}>Coloque el documento oficial dentro del recuadro luminoso.</Text>

            {/* Simulated Camera Window */}
            <View style={styles.cameraFrame}>
              {/* Corner Targets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {ocrScanning ? (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color={COLORS.accent} />
                  <Text style={styles.scanningText}>Procesando OCR, validando TIP...</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${ocrProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{ocrProgress}%</Text>
                </View>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraPlaceholderIcon}>📄</Text>
                  <Text style={styles.cameraPlaceholderText}>Tarjeta de Circulación Física</Text>
                </View>
              )}
            </View>

            {!ocrScanning && (
              <TouchableOpacity style={styles.captureBtn} onPress={startOCRScan}>
                <Text style={styles.captureBtnText}>📸 Capturar e Investigar Registro</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrentScreen('dashboard')}>
              <Text style={styles.cancelBtnText}>Regresar a Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SCREEN 6: PAYMENT CHECKOUT */}
        {currentScreen === 'payment_checkout' && pendingPermit && (
          <View style={styles.checkoutContainer}>
            <Text style={styles.checkoutTitle}>Checkout y Pago Seguro</Text>
            <Text style={styles.checkoutSubtitle}>Tu orden de permiso {pendingPermit.id} se encuentra pendiente de validación de fondos.</Text>

            <View style={styles.checkoutDetailsCard}>
              <View style={styles.checkoutRow}>
                <Text style={styles.checkoutDetailLabel}>Trámite:</Text>
                <Text style={styles.checkoutDetailVal}>{pendingPermit.type}</Text>
              </View>
              <View style={styles.checkoutRow}>
                <Text style={styles.checkoutDetailLabel}>Vigencia:</Text>
                <Text style={styles.checkoutDetailVal}>{pendingPermit.startDate} al {pendingPermit.endDate}</Text>
              </View>
              <View style={styles.checkoutDivider} />
              <View style={styles.checkoutRow}>
                <Text style={styles.totalLabel}>Monto a Liquidar:</Text>
                <Text style={styles.totalVal}>${pendingPermit.cost}.00 MXN</Text>
              </View>
            </View>

            {/* SPEI Option */}
            <Text style={styles.paySectionTitle}>Método 1: Transferencia SPEI (Inmediato)</Text>
            <View style={styles.payMethodCard}>
              <Text style={styles.bankName}>Banco Receptor: STP / Asegura</Text>
              <Text style={styles.clabeLabel}>CLABE Interbancaria Única:</Text>
              <View style={styles.clabeContainer}>
                <Text style={styles.clabeText}>6461 8000 1234 5678 90</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert('Copiado', 'CLABE copiada al portapapeles.')}>
                  <Text style={styles.copyBtnText}>Copiar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.clabeNote}>El permiso se activará automáticamente al confirmarse la transferencia.</Text>
            </View>

            {/* OXXO Pay Option */}
            <Text style={styles.paySectionTitle}>Método 2: Pago en Efectivo (OXXO Pay)</Text>
            <View style={styles.payMethodCard}>
              <Text style={styles.oxxoTitle}>OXXO Pay Barcode</Text>
              <View style={styles.barcodePlaceholder}>
                <View style={styles.barcodeLine} />
                <View style={[styles.barcodeLine, { width: 4 }]} />
                <View style={[styles.barcodeLine, { width: 1 }]} />
                <View style={[styles.barcodeLine, { width: 6 }]} />
                <View style={styles.barcodeLine} />
                <View style={[styles.barcodeLine, { width: 8 }]} />
                <View style={[styles.barcodeLine, { width: 2 }]} />
                <View style={styles.barcodeLine} />
              </View>
              <Text style={styles.oxxoCode}>Reference: 9384-2198-4721-09</Text>
              <Text style={styles.clabeNote}>Muestra este código de barras al cajero de OXXO para pagar tu trámite.</Text>
            </View>

            {/* Simulation Controllers */}
            <View style={styles.simButtonsContainer}>
              <TouchableOpacity style={styles.successPaymentBtn} onPress={() => handleSimulatePayment(true)}>
                <Text style={styles.successPaymentBtnText}>✅ Simular SPEI Exitoso</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pendingPaymentBtn} onPress={() => handleSimulatePayment(false)}>
                <Text style={styles.pendingPaymentBtnText}>⏳ Dejar Pago Pendiente</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  header: {
    height: 70,
    backgroundColor: COLORS.bgSlate,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  logoTextSymbol: {
    fontSize: 20,
  },
  logoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  logoSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // ONBOARDING
  onboardingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingEmoji: {
    fontSize: 70,
    marginVertical: 32,
  },
  onboardingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  primaryBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresList: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  featureSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // DASHBOARD
  dashboardContainer: {
    padding: 16,
  },
  welcomeBanner: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  welcomeSubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: (width - 44) / 2,
    height: 120,
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    justifyContent: 'space-between',
  },
  actionCardIcon: {
    fontSize: 28,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  actionCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  floatingActionBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  floatingActionBtnText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  plateBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.accent,
    backgroundColor: COLORS.accentGlow,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  vehicleCardDetail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  permitCard: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  permitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  permitCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  permitCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  permitDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  permitBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  permitLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  permitValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  qrLabel: {
    fontSize: 9,
    color: COLORS.success,
    marginTop: 4,
    fontWeight: '600',
  },
  payNowBtn: {
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  payNowBtnText: {
    color: COLORS.bgDeep,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // FORMS
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  formSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  ocrQuickBtn: {
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  ocrQuickBtnText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.bgSlate,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    height: 50,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  pickerSimulated: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  pickerOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  pickerOptionTextSelected: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.bgSlate,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  segmentBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  segmentBtnTextActive: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  dayBtn: {
    width: (width - 64) / 4,
    height: 40,
    backgroundColor: COLORS.bgSlate,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  dayBtnTextActive: {
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  priceSummaryCard: {
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  priceSummaryLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceSummaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginVertical: 4,
  },
  priceSummaryDetail: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // OCR
  ocrContainer: {
    padding: 16,
    alignItems: 'center',
  },
  ocrHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 12,
  },
  ocrDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  cameraFrame: {
    width: width - 48,
    height: 220,
    backgroundColor: '#000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.accent,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  cameraPlaceholderIcon: {
    fontSize: 50,
  },
  cameraPlaceholderText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  scanningOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
  },
  progressBarBg: {
    width: 180,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  progressText: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
  captureBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  captureBtnText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // CHECKOUT
  checkoutContainer: {
    padding: 16,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  checkoutSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 20,
  },
  checkoutDetailsCard: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkoutDetailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  checkoutDetailVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  checkoutDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  paySectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 10,
  },
  payMethodCard: {
    backgroundColor: COLORS.bgSlate,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  bankName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  clabeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  clabeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgDeep,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  clabeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  copyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  copyBtnText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: 'bold',
  },
  clabeNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  oxxoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  barcodePlaceholder: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginVertical: 12,
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#000',
    marginHorizontal: 2,
  },
  oxxoCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  simButtonsContainer: {
    marginTop: 20,
  },
  successPaymentBtn: {
    height: 50,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successPaymentBtnText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
  pendingPaymentBtn: {
    height: 50,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingPaymentBtnText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
