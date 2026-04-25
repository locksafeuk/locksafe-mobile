import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Wrench,
  Package,
  Calculator,
} from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { submitQuote } from '../../../../services/api/jobs';
import { LocationService } from '../../../../services/location';
import type { LockType, Difficulty } from '../../../../types';

interface QuotePart {
  name: string;
  quantity: number;
  unitPrice: number;
}

const LOCK_TYPES: { value: LockType; label: string }[] = [
  { value: 'cylinder', label: 'Euro Cylinder' },
  { value: 'mortice', label: 'Mortice Lock' },
  { value: 'multipoint', label: 'Multi-point Lock' },
  { value: 'rim', label: 'Rim Lock' },
  { value: 'padlock', label: 'Padlock' },
  { value: 'car', label: 'Car Lock' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'hard', label: 'Hard', color: 'bg-orange-100 text-orange-700' },
  { value: 'specialist', label: 'Specialist', color: 'bg-red-100 text-red-700' },
];

export default function LocksmithQuoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob } = useJobStore();

  const [lockType, setLockType] = useState<LockType>('cylinder');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [defect, setDefect] = useState('');
  const [labourCost, setLabourCost] = useState('65');
  const [labourTime, setLabourTime] = useState('30');
  const [parts, setParts] = useState<QuotePart[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New part form
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');
  const [newPartPrice, setNewPartPrice] = useState('');


  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  const addPart = () => {
    if (!newPartName || !newPartPrice) {
      Alert.alert('Missing Info', 'Please enter part name and price.');
      return;
    }

    setParts([
      ...parts,
      {
        name: newPartName,
        quantity: parseInt(newPartQty, 10) || 1,
        unitPrice: parseFloat(newPartPrice) || 0,
      },
    ]);

    setNewPartName('');
    setNewPartQty('1');
    setNewPartPrice('');
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // Calculate totals
  const partsTotal = parts.reduce(
    (sum, part) => sum + part.quantity * part.unitPrice,
    0
  );
  const labourTotal = parseFloat(labourCost) || 0;
  const subtotal = partsTotal + labourTotal;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  const handleSubmit = async () => {
    if (!defect) {
      Alert.alert('Missing Info', 'Please describe the defect/issue.');
      return;
    }

    if (labourTotal === 0 && parts.length === 0) {
      Alert.alert('Missing Info', 'Please add labour cost or parts.');
      return;
    }

    setIsSubmitting(true);

    try {
      const gps = await LocationService.getCurrentPosition();

      const response = await submitQuote(id!, {
        lockType,
        defect,
        difficulty,
        parts: parts.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
        labourCost: labourTotal,
        labourTime: parseInt(labourTime, 10) || 30,
        gps: gps || undefined,
      });

      if (response.success) {
        Alert.alert('Quote Sent', 'The customer has been notified of your quote.', [
          {
            text: 'OK',
            onPress: () => router.replace(`/(locksmith)/job/${id}`),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentJob) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-semibold text-slate-900">
            Create Quote
          </Text>
          <Text className="text-slate-500 text-sm">{currentJob.jobNumber}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 100}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
        {/* Lock Type */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Lock Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {LOCK_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setLockType(type.value)}
                  className={`px-4 py-2 rounded-full ${
                    lockType === type.value
                      ? 'bg-slate-900'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <Text
                    className={
                      lockType === type.value ? 'text-white' : 'text-slate-700'
                    }
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Difficulty */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Difficulty
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d.value}
                onPress={() => setDifficulty(d.value)}
                className={`px-4 py-2 rounded-full ${
                  difficulty === d.value
                    ? d.color
                    : 'bg-white border border-slate-200'
                }`}
              >
                <Text
                  className={
                    difficulty === d.value
                      ? d.color.split(' ')[1]
                      : 'text-slate-700'
                  }
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Defect Description */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Defect / Issue
          </Text>
          <View className="bg-white rounded-xl border border-slate-200 p-3">
            <TextInput
              value={defect}
              onChangeText={setDefect}
              placeholder="Describe what was wrong..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Labour */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center mb-3">
            <Wrench size={16} color="#64748b" />
            <Text className="text-sm font-medium text-slate-500 uppercase ml-2">
              Labour
            </Text>
          </View>
          <View className="bg-white rounded-xl border border-slate-200 p-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-600 text-sm mb-1">Cost (£)</Text>
                <TextInput
                  value={labourCost}
                  onChangeText={setLabourCost}
                  keyboardType="numeric"
                  className="bg-slate-100 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="65"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-600 text-sm mb-1">Time (mins)</Text>
                <TextInput
                  value={labourTime}
                  onChangeText={setLabourTime}
                  keyboardType="numeric"
                  className="bg-slate-100 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="30"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Parts */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center mb-3">
            <Package size={16} color="#64748b" />
            <Text className="text-sm font-medium text-slate-500 uppercase ml-2">
              Parts
            </Text>
          </View>

          {/* Parts List */}
          {parts.map((part, index) => (
            <View
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-3 mb-2 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-slate-900 font-medium">{part.name}</Text>
                <Text className="text-slate-500 text-sm">
                  {part.quantity} x £{part.unitPrice.toFixed(2)}
                </Text>
              </View>
              <Text className="text-slate-900 font-semibold mr-3">
                £{(part.quantity * part.unitPrice).toFixed(2)}
              </Text>
              <Pressable onPress={() => removePart(index)}>
                <Trash2 size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}

          {/* Add Part Form */}
          <View className="bg-slate-100 rounded-xl p-3">
            <View className="flex-row gap-2 mb-2">
              <TextInput
                value={newPartName}
                onChangeText={setNewPartName}
                placeholder="Part name"
                className="flex-1 bg-white rounded-lg px-3 py-2 text-slate-900"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="flex-row gap-2">
              <TextInput
                value={newPartQty}
                onChangeText={setNewPartQty}
                placeholder="Qty"
                keyboardType="numeric"
                className="w-16 bg-white rounded-lg px-3 py-2 text-slate-900 text-center"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                value={newPartPrice}
                onChangeText={setNewPartPrice}
                placeholder="Price £"
                keyboardType="numeric"
                className="flex-1 bg-white rounded-lg px-3 py-2 text-slate-900"
                placeholderTextColor="#94a3b8"
              />
              <Pressable
                onPress={addPart}
                className="bg-slate-900 px-4 rounded-lg items-center justify-center"
              >
                <Plus size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quote Summary */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row items-center mb-3">
            <Calculator size={16} color="#64748b" />
            <Text className="text-sm font-medium text-slate-500 uppercase ml-2">
              Quote Summary
            </Text>
          </View>
          <View className="bg-white rounded-xl border border-slate-200 p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600">Parts</Text>
              <Text className="text-slate-900">£{partsTotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600">Labour</Text>
              <Text className="text-slate-900">£{labourTotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600">Subtotal</Text>
              <Text className="text-slate-900">£{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600">VAT (20%)</Text>
              <Text className="text-slate-900">£{vat.toFixed(2)}</Text>
            </View>
            <View className="border-t border-slate-200 pt-2 mt-2 flex-row justify-between">
              <Text className="text-lg font-semibold text-slate-900">Total</Text>
              <Text className="text-lg font-bold text-orange-500">
                £{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        {/* Submit Button */}
        <View className="p-4 bg-white border-t border-slate-200 mt-4">
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`py-4 rounded-xl items-center flex-row justify-center ${
              isSubmitting ? 'bg-slate-300' : 'bg-slate-900 active:bg-slate-800'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FileText size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Send Quote to Customer
                </Text>
              </>
            )}
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
